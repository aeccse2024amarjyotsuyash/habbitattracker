import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, Play, Pause, RotateCcw, Maximize } from 'lucide-react';
import { createFocusSession } from '@/db/api';
import { useToast } from '@/hooks/use-toast';

export function FocusMode() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'stopwatch' | 'pomodoro'>('stopwatch');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pomodoroMinutes] = useState(25);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (mode === 'pomodoro' && prev >= pomodoroMinutes * 60) {
            setIsRunning(false);
            handleSaveSession(prev);
            toast({
              title: '🎉 Pomodoro Complete!',
              description: 'Great work! Time for a break.',
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode, pomodoroMinutes]);

  const handleSaveSession = async (duration: number) => {
    if (!user || duration < 60) return;

    const today = new Date().toISOString().split('T')[0];
    try {
      await createFocusSession({
        user_id: user.id,
        duration,
        session_type: mode,
        date: today,
      });
    } catch (error) {
      console.error('Failed to save focus session:', error);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    if (seconds > 0 && !isRunning) {
      handleSaveSession(seconds);
    }
    setIsRunning(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (mode === 'pomodoro') {
      return (seconds / (pomodoroMinutes * 60)) * 100;
    }
    return 0;
  };

  const FullscreenContent = () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">
          {mode === 'stopwatch' ? 'Stopwatch' : 'Pomodoro Timer'}
        </h1>
        
        <div className="text-8xl font-mono font-bold">
          {formatTime(seconds)}
        </div>

        {mode === 'pomodoro' && (
          <div className="w-full max-w-md">
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          {!isRunning ? (
            <Button size="lg" onClick={handleStart}>
              <Play className="h-6 w-6 mr-2" />
              Start
            </Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={handlePause}>
              <Pause className="h-6 w-6 mr-2" />
              Pause
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={handleReset}>
            <RotateCcw className="h-6 w-6 mr-2" />
            Reset
          </Button>
          <Button size="lg" variant="outline" onClick={() => setIsFullscreen(false)}>
            Exit Fullscreen
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Focus Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'stopwatch' | 'pomodoro')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
              <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-4">
              {formatTime(seconds)}
            </div>

            {mode === 'pomodoro' && (
              <div className="mb-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              {!isRunning ? (
                <Button size="sm" onClick={handleStart}>
                  <Play className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={handlePause}>
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsFullscreen(true)}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-full h-full p-0 border-0">
          <FullscreenContent />
        </DialogContent>
      </Dialog>
    </>
  );
}
