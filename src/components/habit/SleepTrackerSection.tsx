import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Moon, Plus } from 'lucide-react';
import { getSleepLogs, upsertSleepLog } from '@/db/api';
import type { SleepLog } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function SleepTrackerSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sleepTime, setSleepTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [quality, setQuality] = useState('3');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      loadSleepLogs();
    }
  }, [user]);

  const loadSleepLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();
      
      const data = await getSleepLogs(
        user.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setSleepLogs(data);
    } catch (error) {
      console.error('Failed to load sleep logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (sleep: string, wake: string) => {
    const [sleepHour, sleepMin] = sleep.split(':').map(Number);
    const [wakeHour, wakeMin] = wake.split(':').map(Number);
    
    let sleepMinutes = sleepHour * 60 + sleepMin;
    let wakeMinutes = wakeHour * 60 + wakeMin;
    
    if (wakeMinutes < sleepMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    return wakeMinutes - sleepMinutes;
  };

  const handleSaveSleepLog = async () => {
    if (!user) return;

    const duration = calculateDuration(sleepTime, wakeTime);

    try {
      await upsertSleepLog({
        user_id: user.id,
        date: selectedDate,
        sleep_time: sleepTime,
        wake_time: wakeTime,
        duration,
        quality: Number.parseInt(quality),
        notes: notes.trim() || null,
      });

      await loadSleepLogs();
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Sleep log saved successfully',
      });
    } catch (error) {
      console.error('Failed to save sleep log:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sleep log',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSleepTime('22:00');
    setWakeTime('06:00');
    setQuality('3');
    setNotes('');
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getQualityColor = (quality: number | null) => {
    if (!quality) return 'bg-muted';
    if (quality >= 4) return 'bg-green-500';
    if (quality >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAverageStats = () => {
    if (sleepLogs.length === 0) return { avgDuration: 0, avgQuality: 0 };
    
    const totalDuration = sleepLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalQuality = sleepLogs.reduce((sum, log) => sum + (log.quality || 0), 0);
    
    return {
      avgDuration: Math.floor(totalDuration / sleepLogs.length),
      avgQuality: (totalQuality / sleepLogs.length).toFixed(1),
    };
  };

  const stats = getAverageStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Moon className="h-6 w-6" />
          Sleep Tracker
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Sleep</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sleep-date">Date</Label>
                <Input
                  id="sleep-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sleep-time">Sleep Time</Label>
                  <Input
                    id="sleep-time"
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wake-time">Wake Time</Label>
                  <Input
                    id="wake-time"
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleep-quality">Sleep Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger id="sleep-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">⭐ Poor</SelectItem>
                    <SelectItem value="2">⭐⭐ Fair</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ Very Good</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleep-notes">Notes (optional)</Label>
                <Textarea
                  id="sleep-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about your sleep..."
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveSleepLog} className="w-full">
                Save Sleep Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Average Sleep Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatDuration(stats.avgDuration)}</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Sleep Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgQuality} / 5</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sleep History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sleepLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sleep logs yet. Start tracking your sleep!
            </div>
          ) : (
            <div className="space-y-4">
              {sleepLogs.map(log => (
                <div key={log.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className={`w-2 h-16 rounded-full ${getQualityColor(log.quality)}`} />
                  <div className="flex-1">
                    <div className="font-semibold">{format(new Date(log.date), 'MMMM d, yyyy')}</div>
                    <div className="text-sm text-muted-foreground">
                      {log.sleep_time} - {log.wake_time} ({formatDuration(log.duration)})
                    </div>
                    {log.notes && (
                      <div className="text-sm text-muted-foreground mt-1">{log.notes}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Quality</div>
                    <div className="text-2xl font-bold">{log.quality}/5</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
