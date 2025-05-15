
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { youtubersApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Trash, Plus } from 'lucide-react';

const YoutuberManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [newYoutuberName, setNewYoutuberName] = useState('');
  const [newYoutuberSlug, setNewYoutuberSlug] = useState('');
  const [newYoutuberUrl, setNewYoutuberUrl] = useState('');

  // Fetch youtubers
  const { data, isLoading, error } = useQuery({
    queryKey: ['youtubers'],
    queryFn: youtubersApi.getAll
  });
  
  // Extract youtubers from the data
  const youtubers = data || [];

  // Delete youtuber mutation
  const deleteMutation = useMutation({
    mutationFn: youtubersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youtubers'] });
      toast({
        title: "Youtuber Deleted",
        description: "Youtuber has been deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: `Failed to delete youtuber: ${(error as Error).message}`
      });
    }
  });

  // Create youtuber mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string, slug: string, channelUrl?: string }) => 
      youtubersApi.create(data.name, data.slug, data.channelUrl),
    onSuccess: () => {
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['youtubers'] });
      toast({
        title: "Youtuber Created",
        description: "New youtuber has been added successfully"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: `Failed to create youtuber: ${(error as Error).message}`
      });
    }
  });

  const handleDeleteYoutuber = (slug: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(slug);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setNewYoutuberName(name);
    
    // Auto-generate slug if user hasn't manually set one
    if (!newYoutuberSlug || newYoutuberSlug === generateSlug(newYoutuberName)) {
      setNewYoutuberSlug(generateSlug(name));
    }
  };

  const handleCreateYoutuber = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newYoutuberName || !newYoutuberSlug) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Name and slug are required"
      });
      return;
    }
    
    createMutation.mutate({
      name: newYoutuberName,
      slug: newYoutuberSlug,
      channelUrl: newYoutuberUrl || undefined
    });
  };

  const resetForm = () => {
    setNewYoutuberName('');
    setNewYoutuberSlug('');
    setNewYoutuberUrl('');
  };

  if (isLoading) {
    return <div className="p-4 animate-pulse bg-muted rounded">Loading youtubers...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded">
        <p>Error loading youtubers: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Manage Youtubers</h2>
      
      <form onSubmit={handleCreateYoutuber} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium mb-1 block">Name</label>
            <Input 
              id="name"
              value={newYoutuberName} 
              onChange={handleNameChange}
              placeholder="e.g., Daniel Negreanu"
            />
          </div>
          
          <div>
            <label htmlFor="slug" className="text-sm font-medium mb-1 block">Slug</label>
            <Input 
              id="slug"
              value={newYoutuberSlug} 
              onChange={(e) => setNewYoutuberSlug(e.target.value)}
              placeholder="e.g., daniel-negreanu"
            />
          </div>
          
          <div>
            <label htmlFor="url" className="text-sm font-medium mb-1 block">Channel URL (optional)</label>
            <Input 
              id="url"
              value={newYoutuberUrl} 
              onChange={(e) => setNewYoutuberUrl(e.target.value)}
              placeholder="https://youtube.com/c/..."
            />
          </div>
        </div>
        
        <Button type="submit" disabled={!newYoutuberName || !newYoutuberSlug || createMutation.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Add Youtuber
        </Button>
      </form>
      
      <div className="rounded-md border">
        <div className="p-4 bg-muted/50">
          <div className="grid grid-cols-3 font-medium">
            <div>Name</div>
            <div>Slug</div>
            <div className="text-right">Actions</div>
          </div>
        </div>
        
        <div className="divide-y">
          {youtubers.length > 0 ? (
            youtubers.map((youtuber) => (
              <div key={youtuber.id || youtuber.slug} className="p-4 grid grid-cols-3 items-center">
                <div>{youtuber.name}</div>
                <div className="text-muted-foreground">{youtuber.slug}</div>
                <div className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteYoutuber(youtuber.slug, youtuber.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No youtubers found. Create your first youtuber above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YoutuberManager;
