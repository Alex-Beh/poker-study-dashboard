
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TagManager = () => {
  const [newTagName, setNewTagName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
    meta: {
      onError: (error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Failed to load tags',
          description: error.message
        });
      }
    }
  });

  // Add tag mutation
  const addTagMutation = useMutation({
    mutationFn: (name: string) => tagsApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setNewTagName('');
      toast({
        title: 'Tag created',
        description: 'Your new tag has been created successfully.'
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create tag',
        description: error.message
      });
    }
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: (slug: string) => tagsApi.delete(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({
        title: 'Tag deleted',
        description: 'The tag has been deleted successfully.'
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete tag',
        description: error.message
      });
    }
  });

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      addTagMutation.mutate(newTagName.trim());
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Manage Tags</h2>
      
      <form onSubmit={handleAddTag} className="flex space-x-2">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name"
          className="flex-1"
        />
        <Button type="submit" disabled={!newTagName.trim() || addTagMutation.isPending}>
          Add Tag
        </Button>
      </form>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Existing Tags</h3>
        {isLoading ? (
          <p>Loading tags...</p>
        ) : tags.length > 0 ? (
          <ul className="space-y-2">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                <span>{tag.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTagMutation.mutate(tag.slug)}
                  disabled={deleteTagMutation.isPending}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No tags found. Create your first tag above.</p>
        )}
      </div>
    </div>
  );
};

export default TagManager;
