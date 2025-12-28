import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { getFocusSessions } from '@/db/api';
import type { Habit, HabitLog, FocusSession } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Clock, Calendar as CalendarIcon } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface AnalyticsSectionProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  selectedMonth: number;
  selectedYear: number;
}

export function AnalyticsSection({ habits, habitLogs, selectedMonth, selectedYear }: AnalyticsSectionProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFocusSessions();
    }
  }, [user, selectedMonth, selectedYear]);

  const loadFocusSessions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      const sessionsData = await getFocusSessions(user.id, startDate, endDate);
      setFocusSessions(sessionsData);
    } catch (error) {
      console.error('Failed to load focus sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionStats = () => {
    const totalLogs = habitLogs.length;
    const doneLogs = habitLogs.filter(l => l.status === 'done').length;
    const skipLogs = habitLogs.filter(l => l.status === 'skip').length;
    const emptyLogs = habitLogs.filter(l => l.status === 'empty').length;

    return [
      { name: 'Done', value: doneLogs, percentage: totalLogs > 0 ? ((doneLogs / totalLogs) * 100).toFixed(1) : 0 },
      { name: 'Skip', value: skipLogs, percentage: totalLogs > 0 ? ((skipLogs / totalLogs) * 100).toFixed(1) : 0 },
      { name: 'Empty', value: emptyLogs, percentage: totalLogs > 0 ? ((emptyLogs / totalLogs) * 100).toFixed(1) : 0 },
    ];
  };

  const getHabitPerformance = () => {
    return habits.map(habit => {
      const habitLogsForHabit = habitLogs.filter(l => l.habit_id === habit.id);
      const doneCount = habitLogsForHabit.filter(l => l.status === 'done').length;
      const skipCount = habitLogsForHabit.filter(l => l.status === 'skip').length;
      
      return {
        name: habit.name.length > 15 ? habit.name.substring(0, 15) + '...' : habit.name,
        done: doneCount,
        skip: skipCount,
      };
    });
  };

  const getTotalFocusTime = () => {
    return focusSessions.reduce((total, session) => total + session.duration, 0);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const stats = getCompletionStats();
  const habitPerformance = getHabitPerformance();
  const totalFocusTime = getTotalFocusTime();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{habits.length}</div>
            <p className="text-xs text-muted-foreground">Active this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[0].percentage}%</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalFocusTime)}</div>
            <p className="text-xs text-muted-foreground">Total this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Completion Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Focus Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Sessions</span>
                    <span className="text-2xl font-bold">{focusSessions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Time</span>
                    <span className="text-2xl font-bold">{formatDuration(totalFocusTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Session</span>
                    <span className="text-2xl font-bold">
                      {focusSessions.length > 0 ? formatDuration(Math.floor(totalFocusTime / focusSessions.length)) : '0h 0m'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Habit Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={habitPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="done" fill="#10B981" name="Done" />
                  <Bar dataKey="skip" fill="#EF4444" name="Skip" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
