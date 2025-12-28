import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/db/api';
import type { Todo } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function TodoList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [loading, setLoading] = useState(true);

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
      });

      if (newTodo) {
        setTodos([...todos, newTodo]);
        setNewTodoTitle('');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">To-Do List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Add a task..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
          />
          <Button size="icon" onClick={handleAddTodo}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {todos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks yet
              </p>
            ) : (
              todos.map(todo => (
                <div key={todo.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={(checked) => handleToggleTodo(todo.id, checked as boolean)}
                  />
                  <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.title}
                  </span>
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
