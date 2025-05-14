
import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { tagsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Trash, Plus } from 'lucide-react';

interface TagManagerProps {
  tags: Array<{ id: number; name: string; slug: string }>;
  isLoading: boolean;
  error: Error | null;
}

const TagManager: React.FC<TagManagerProps> = ({ tags, isLoading, error }) => {
  const queryClient = useQueryClient();
  const [newTagName, setNewTagName] = useState('');
  
  // Load tags from API
  const { data: tagsData, isLoading: loadingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
    enabled: tags.length === 0, // Only fetch if we don't have tags
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to load tags",
        description: (error as Error).message
      });
    }
  });
  
  // Delete tag mutation
  const deleteMutation = useMutation({
    mutationFn: tagsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({
        title: "Tag Deleted",
        description: "Tag successfully deleted"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: `Failed to delete tag: ${(error as Error).message}`
      });
    }
  });

  // Create tag mutation
  const createMutation = useMutation({
    mutationFn: (name: string) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      return tagsApi.create({ name, slug });
    },
    onSuccess: () => {
      setNewTagName('');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({
        title: "Tag Created",
        description: "Tag successfully created"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: `Failed to create tag: ${(error as Error).message}`
      });
    }
  });
  
  const handleDeleteTag = (slug: string, name: string) => {
    if (confirm(`Are you sure you want to delete the tag "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(slug);
    }
  };
  
  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      createMutation.mutate(newTagName.trim());
    }
  };

  // Use API data if available, otherwise use props
  const displayTags = tagsData?.data || tags;
  const isDataLoading = isLoading || loadingTags;
  
  if (isDataLoading) {
    return <div className="p-4 animate-pulse bg-muted rounded">Loading tags...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded">
        <p>Error loading tags: {error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Manage Tags</h2>
      
      <form onSubmit={handleCreateTag} className="flex gap-2 mb-4">
        <Input 
          value={newTagName} 
          onChange={(e) => setNewTagName(e.target.value)} 
          placeholder="New tag name"
          className="flex-1"
        />
        <Button type="submit" disabled={!newTagName.trim() || createMutation.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </form>
      
      <div className="rounded-md border">
        <div className="p-4 bg-muted/50">
          <div className="grid grid-cols-2 font-medium">
            <div>Name</div>
            <div className="text-right">Actions</div>
          </div>
        </div>
        
        <div className="divide-y">
          {displayTags && displayTags.length > 0 ? (
            displayTags.map((tag) => (
              <div key={tag.slug} className="p-4 grid grid-cols-2 items-center">
                <div>{tag.name}</div>
                <div className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.slug, tag.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No tags found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagManager;
