import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download, TrendingUp, Target, Clock, Moon } from 'lucide-react';
import { getHabits, createHabit, deleteHabit, getHabitLogs, upsertHabitLog, getFocusSessions, getSleepLogs, getGoals } from '@/db/api';
import type { Habit, HabitLog, FocusSession, SleepLog, Goal } from '@/types';
import { HabitTable } from '@/components/habit/HabitTable';
import { TodoList } from '@/components/habit/TodoList';
import { WaterReminder } from '@/components/habit/WaterReminder';
import { FocusMode } from '@/components/habit/FocusMode';
import { ShortcutsPanel } from '@/components/habit/ShortcutsPanel';
import { AnalyticsSection } from '@/components/habit/AnalyticsSection';
import { SleepTrackerSection } from '@/components/habit/SleepTrackerSection';
import { GoalsSection } from '@/components/habit/GoalsSection';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitPriority, setNewHabitPriority] = useState('0');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('habits');

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user, selectedMonth, selectedYear]);

  const loadHabits = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const habitsData = await getHabits(user.id, selectedMonth, selectedYear);
      setHabits(habitsData);
      
      if (habitsData.length > 0) {
        const habitIds = habitsData.map(h => h.id);
        const logsData = await getHabitLogs(habitIds);
        setHabitLogs(logsData);
      }
    } catch (error) {
      console.error('Failed to load habits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load habits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async () => {
    if (!user || !newHabitName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a habit name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newHabit = await createHabit({
        user_id: user.id,
        name: newHabitName.trim(),
        priority: Number.parseInt(newHabitPriority),
        month: selectedMonth,
        year: selectedYear,
      });

      if (newHabit) {
        setHabits([...habits, newHabit]);
        setNewHabitName('');
        setNewHabitPriority('0');
        setIsAddDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Habit added successfully',
        });
      }
    } catch (error) {
      console.error('Failed to add habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to add habit',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      setHabits(habits.filter(h => h.id !== habitId));
      setHabitLogs(habitLogs.filter(l => l.habit_id !== habitId));
      toast({
        title: 'Success',
        description: 'Habit deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete habit',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateHabitLog = async (habitId: string, date: string, status: 'done' | 'skip' | 'empty') => {
    if (!user) return;

    try {
      const log = await upsertHabitLog({
        habit_id: habitId,
        date,
        status,
      });

      if (log) {
        setHabitLogs(prev => {
          const filtered = prev.filter(l => !(l.habit_id === habitId && l.date === date));
          return [...filtered, log];
        });
      }
    } catch (error) {
      console.error('Failed to update habit log:', error);
      toast({
        title: 'Error',
        description: 'Failed to update habit status',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    let csv = 'Habit,' + dates.join(',') + '\n';
    
    habits.forEach(habit => {
      const row = [habit.name];
      dates.forEach(day => {
        const date = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const log = habitLogs.find(l => l.habit_id === habit.id && l.date === date);
        row.push(log?.status || 'empty');
      });
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits-${selectedYear}-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Habits exported to CSV',
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sleep">Sleep Tracker</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="habits" className="space-y-6">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number.parseInt(v))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={month} value={String(index + 1)}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number.parseInt(e.target.value) || new Date().getFullYear())}
                className="w-32"
                min="2000"
                max="2100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Habit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Habit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="habit-name">Habit Name</Label>
                      <Input
                        id="habit-name"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder="Enter habit name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="habit-priority">Priority</Label>
                      <Select value={newHabitPriority} onValueChange={setNewHabitPriority}>
                        <SelectTrigger id="habit-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Normal</SelectItem>
                          <SelectItem value="1">High</SelectItem>
                          <SelectItem value="2">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddHabit} className="w-full">
                      Add Habit
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Habit Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <HabitTable
                      habits={habits}
                      habitLogs={habitLogs}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      onUpdateLog={handleUpdateHabitLog}
                      onDeleteHabit={handleDeleteHabit}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <TodoList />
              <WaterReminder />
              <FocusMode />
              <ShortcutsPanel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsSection 
            habits={habits}
            habitLogs={habitLogs}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </TabsContent>

        <TabsContent value="sleep">
          <SleepTrackerSection />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
