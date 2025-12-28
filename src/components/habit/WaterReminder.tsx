import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplet, Plus, Minus, Bell } from 'lucide-react';
import { getWaterReminder, upsertWaterReminder } from '@/db/api';
import { useToast } from '@/hooks/use-toast';

export function WaterReminder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [count, setCount] = useState(0);
  const [targetGlasses, setTargetGlasses] = useState(8);
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [completedGlasses, setCompletedGlasses] = useState(0);

  useEffect(() => {
    if (user) {
      loadWaterCount();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, remainingTime]);

  const loadWaterCount = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    try {
      const data = await getWaterReminder(user.id, today);
      setCount(data?.count || 0);
    } catch (error) {
      console.error('Failed to load water count:', error);
    }
  };

  const updateWaterCount = async (newCount: number) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    try {
      await upsertWaterReminder({
        user_id: user.id,
        date: today,
        count: newCount,
      });
      setCount(newCount);
    } catch (error) {
      console.error('Failed to update water count:', error);
      toast({
        title: 'Error',
        description: 'Failed to update water count',
        variant: 'destructive',
      });
    }
  };

  const handleIncrement = () => {
    updateWaterCount(count + 1);
  };

  const handleDecrement = () => {
    if (count > 0) {
      updateWaterCount(count - 1);
    }
  };

  const handleTimerComplete = () => {
    setCompletedGlasses(prev => prev + 1);
    
    sendNotification(completedGlasses + 1);
    
    if (completedGlasses + 1 < targetGlasses) {
      setRemainingTime(timerMinutes * 60);
      toast({
        title: '💧 Water Reminder',
        description: `Glass ${completedGlasses + 1} of ${targetGlasses} - Time to drink water!`,
      });
    } else {
      setIsTimerActive(false);
      setCompletedGlasses(0);
      toast({
        title: '🎉 Goal Complete!',
        description: `You've completed all ${targetGlasses} glasses today!`,
      });
    }
  };

  const startTimer = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    setCompletedGlasses(0);
    setRemainingTime(timerMinutes * 60);
    setIsTimerActive(true);
    toast({
      title: 'Timer Started',
      description: `Water reminder set for ${targetGlasses} glasses, every ${timerMinutes} minutes`,
    });
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    setRemainingTime(0);
    setCompletedGlasses(0);
  };

  const sendNotification = (glassNumber: number) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('💧 Water Reminder', {
        body: `Glass ${glassNumber} of ${targetGlasses} - Time to drink water! Stay hydrated!`,
        icon: '/favicon.png',
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          Water Reminder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button size="icon" variant="outline" onClick={handleDecrement}>
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="text-3xl font-bold">{count}</div>
            <div className="text-xs text-muted-foreground">glasses today</div>
          </div>
          <Button size="icon" onClick={handleIncrement}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-glasses">Target Glasses</Label>
          <Input
            id="target-glasses"
            type="number"
            value={targetGlasses}
            onChange={(e) => setTargetGlasses(Number.parseInt(e.target.value) || 8)}
            min="1"
            max="20"
            disabled={isTimerActive}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timer-minutes">Interval (minutes)</Label>
          <Input
            id="timer-minutes"
            type="number"
            value={timerMinutes}
            onChange={(e) => setTimerMinutes(Number.parseInt(e.target.value) || 60)}
            min="1"
            max="180"
            disabled={isTimerActive}
          />
        </div>

        {isTimerActive ? (
          <div className="space-y-2">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                Glass {completedGlasses + 1} of {targetGlasses}
              </div>
              <div className="text-2xl font-mono font-bold">
                {formatTime(remainingTime)}
              </div>
            </div>
            <Button variant="destructive" className="w-full" onClick={stopTimer}>
              Stop Timer
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={startTimer}>
            <Bell className="h-4 w-4 mr-2" />
            Start Timer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
