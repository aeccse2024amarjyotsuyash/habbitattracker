import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/db/api';
import type { Todo } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, isToday, isPast, isFuture, parseISO } from 'date-fns';

export function TodoList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDueDate, setNewTodoDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      loadTodos();
    }
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;
    
    try {
      const data = await getTodos(user.id);
      setTodos(data);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!user || !newTodoTitle.trim()) return;

    try {
      const newTodo = await createTodo({
        user_id: user.id,
        title: newTodoTitle.trim(),
        completed: false,
        position: todos.length,
        due_date: newTodoDueDate || null,
      });

      if (newTodo) {
        setTodos([...todos, newTodo]);
        setNewTodoTitle('');
        setNewTodoDueDate('');
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to add todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to add todo',
        variant: 'destructive',
      });
    }
  };

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    try {
      await updateTodo(todoId, { completed });
      setTodos(todos.map(t => t.id === todoId ? { ...t, completed } : t));
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to update todo',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await deleteTodo(todoId);
      setTodos(todos.filter(t => t.id !== todoId));
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete todo',
        variant: 'destructive',
      });
    }
  };

  const getDateLabel = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const date = parseISO(dueDate);
    const formattedDate = format(date, 'MMM d, yyyy');
    
    if (isToday(date)) return `Today (${formattedDate})`;
    if (isPast(date)) return `Overdue (${formattedDate})`;
    return formattedDate;
  };

  const getDateColor = (dueDate: string | null) => {
    if (!dueDate) return '';
    
    const date = parseISO(dueDate);
    if (isToday(date)) return 'text-blue-500';
    if (isPast(date)) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">To-Do List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="todo-title">Task</Label>
                <Input
                  id="todo-title"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="Enter task..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="todo-due-date">Due Date (optional)</Label>
                <Input
                  id="todo-due-date"
                  type="date"
                  value={newTodoDueDate}
                  onChange={(e) => setNewTodoDueDate(e.target.value)}
                  min={today}
                />
                <p className="text-xs text-muted-foreground">Only future dates are allowed</p>
              </div>
              <Button onClick={handleAddTodo} className="w-full">
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {sortedTodos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks yet
              </p>
            ) : (
              sortedTodos.map(todo => (
                <div key={todo.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={(checked) => handleToggleTodo(todo.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm block truncate ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {todo.title}
                    </span>
                    {todo.due_date && (
                      <div className={`flex items-center gap-1 text-xs ${getDateColor(todo.due_date)}`}>
                        <CalendarIcon className="h-3 w-3" />
                        <span>{getDateLabel(todo.due_date)}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
