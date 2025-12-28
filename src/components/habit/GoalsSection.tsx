import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { getGoals, createGoal, updateGoal, deleteGoal } from '@/db/api';
import type { Goal } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function GoalsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getGoals(user.id);
      setGoals(data);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    if (!user || !newTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a goal title',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          target_date: newTargetDate || null,
        });
      } else {
        await createGoal({
          user_id: user.id,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          target_date: newTargetDate || null,
          completed: false,
          progress: 0,
        });
      }

      await loadGoals();
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: editingGoal ? 'Goal updated successfully' : 'Goal created successfully',
      });
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to save goal',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    try {
      await updateGoal(goalId, { progress });
      setGoals(goals.map(g => g.id === goalId ? { ...g, progress } : g));
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
    }
  };

  const handleToggleComplete = async (goalId: string, completed: boolean) => {
    try {
      await updateGoal(goalId, { completed, progress: completed ? 100 : 0 });
      setGoals(goals.map(g => g.id === goalId ? { ...g, completed, progress: completed ? 100 : 0 } : g));
      toast({
        title: 'Success',
        description: completed ? 'Goal completed! 🎉' : 'Goal reopened',
      });
    } catch (error) {
      console.error('Failed to toggle goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      setGoals(goals.filter(g => g.id !== goalId));
      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive',
      });
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewTitle(goal.title);
    setNewDescription(goal.description || '');
    setNewTargetDate(goal.target_date || '');
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingGoal(null);
    setNewTitle('');
    setNewDescription('');
    setNewTargetDate('');
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6" />
          Goals
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Title</Label>
                <Input
                  id="goal-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter goal title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                  id="goal-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your goal..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-target-date">Target Date (optional)</Label>
                <Input
                  id="goal-target-date"
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveGoal} className="w-full">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeGoals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedGoals.length}</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Active Goals</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {activeGoals.map(goal => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          {goal.target_date && (
                            <Badge variant="outline" className="mt-2">
                              Due: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Target className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{goal.progress}%</span>
                        </div>
                        <Progress value={goal.progress} />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateProgress(goal.id, Math.max(0, goal.progress - 10))}
                          >
                            -10%
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress + 10))}
                          >
                            +10%
                          </Button>
                          <Button
                            size="sm"
                            className="ml-auto"
                            onClick={() => handleToggleComplete(goal.id, true)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Completed Goals</h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {completedGoals.map(goal => (
                  <Card key={goal.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            {goal.title}
                          </CardTitle>
                          {goal.target_date && (
                            <Badge variant="outline" className="mt-2">
                              Completed: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => handleToggleComplete(goal.id, false)}
                      >
                        Reopen Goal
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {goals.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No goals yet. Create your first goal to get started!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
