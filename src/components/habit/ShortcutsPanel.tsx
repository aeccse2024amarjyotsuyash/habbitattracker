import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { getShortcuts, createShortcut, deleteShortcut } from '@/db/api';
import type { Shortcut } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function ShortcutsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadShortcuts();
    }
  }, [user]);

  const loadShortcuts = async () => {
    if (!user) return;
    
    try {
      const data = await getShortcuts(user.id);
      setShortcuts(data);
    } catch (error) {
      console.error('Failed to load shortcuts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShortcut = async () => {
    if (!user || !newTitle.trim() || !newUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter title and URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newShortcut = await createShortcut({
        user_id: user.id,
        title: newTitle.trim(),
        url: newUrl.trim(),
        category: newCategory.trim() || null,
        position: shortcuts.length,
      });

      if (newShortcut) {
        setShortcuts([...shortcuts, newShortcut]);
        setNewTitle('');
        setNewUrl('');
        setNewCategory('');
        setIsAddDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Shortcut added successfully',
        });
      }
    } catch (error) {
      console.error('Failed to add shortcut:', error);
      toast({
        title: 'Error',
        description: 'Failed to add shortcut',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteShortcut = async (shortcutId: string) => {
    try {
      await deleteShortcut(shortcutId);
      setShortcuts(shortcuts.filter(s => s.id !== shortcutId));
      toast({
        title: 'Success',
        description: 'Shortcut deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete shortcut:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shortcut',
        variant: 'destructive',
      });
    }
  };

  const handleOpenShortcut = (url: string) => {
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`;
    }
    window.open(finalUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Shortcuts
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Shortcut</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shortcut-title">Title</Label>
                  <Input
                    id="shortcut-title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortcut-url">URL</Label>
                  <Input
                    id="shortcut-url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortcut-category">Category (optional)</Label>
                  <Input
                    id="shortcut-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Work, Personal, etc."
                  />
                </div>
                <Button onClick={handleAddShortcut} className="w-full">
                  Add Shortcut
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {shortcuts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No shortcuts yet
              </p>
            ) : (
              shortcuts.map(shortcut => (
                <div
                  key={shortcut.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted group"
                >
                  <button
                    type="button"
                    onClick={() => handleOpenShortcut(shortcut.url)}
                    className="flex-1 text-left text-sm flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{shortcut.title}</div>
                      {shortcut.category && (
                        <div className="text-xs text-muted-foreground">{shortcut.category}</div>
                      )}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteShortcut(shortcut.id)}
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
