
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchYoutubers, createYoutuber, deleteYoutuber } from '@/services/api';
import { Creator } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const YoutuberManager: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newYoutuberName, setNewYoutuberName] = useState('');
  const [newYoutuberSlug, setNewYoutuberSlug] = useState('');
  const [newYoutuberChannel, setNewYoutuberChannel] = useState('');

  const queryClient = useQueryClient();

  const { data: youtuberResponse, isLoading, error } = useQuery({
    queryKey: ['youtubers'],
    queryFn: fetchYoutubers
  });

  const youtubers = youtuberResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: ({ name, slug, channelUrl }: { name: string, slug: string, channelUrl?: string }) => 
      createYoutuber(name, slug, channelUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtubers'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Youtuber Created",
        description: `Successfully created youtuber: ${newYoutuberName}`
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: `Failed to create youtuber: ${error.message}`
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => deleteYoutuber(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: ['youtubers'] });
      toast({
        title: "Youtuber Deleted",
        description: `Successfully deleted youtuber`
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: `Failed to delete youtuber: ${error.message}`
      });
    }
  });

  const handleCreateYoutuber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYoutuberName || !newYoutuberSlug) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Both name and slug are required"
      });
      return;
    }
    
    createMutation.mutate({ 
      name: newYoutuberName, 
      slug: newYoutuberSlug,
      channelUrl: newYoutuberChannel || undefined 
    });
  };

  const handleDeleteYoutuber = (youtuber: Creator) => {
    if (confirm(`Are you sure you want to delete ${youtuber.name}?`)) {
      deleteMutation.mutate(youtuber.slug);
    }
  };

  const resetForm = () => {
    setNewYoutuberName('');
    setNewYoutuberSlug('');
    setNewYoutuberChannel('');
  };

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded">
        <p>Error loading youtubers: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Youtubers</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Youtuber
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Youtuber</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateYoutuber} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  value={newYoutuberName} 
                  onChange={e => setNewYoutuberName(e.target.value)}
                  placeholder="Youtuber Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input 
                  id="slug"
                  value={newYoutuberSlug} 
                  onChange={e => setNewYoutuberSlug(e.target.value)}
                  placeholder="youtuber-slug"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier (lower-case, no spaces)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">YouTube Channel URL (optional)</Label>
                <Input 
                  id="channel"
                  value={newYoutuberChannel} 
                  onChange={e => setNewYoutuberChannel(e.target.value)}
                  placeholder="https://youtube.com/channel/..."
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Youtuber'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {youtubers.length > 0 ? youtubers.map((youtuber) => (
            <Card key={youtuber.id} className="flex flex-col">
              <CardContent className="flex-1 pt-6">
                <h3 className="font-medium">{youtuber.name}</h3>
                {youtuber.channel_url && (
                  <a 
                    href={youtuber.channel_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Visit Channel
                  </a>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <span className="text-xs text-muted-foreground">Slug: {youtuber.slug}</span>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => handleDeleteYoutuber(youtuber)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )) : (
            <div className="col-span-full p-6 text-center border rounded bg-muted/20">
              <p>No youtubers added yet. Click "Add Youtuber" to create your first one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YoutuberManager;
