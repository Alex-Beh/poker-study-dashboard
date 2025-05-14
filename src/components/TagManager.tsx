
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTag } from '@/services/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Trash } from 'lucide-react';

interface TagManagerProps {
  tags: Array<{ id: number; name: string; slug: string }>;
  isLoading: boolean;
  error: Error | null;
}

const TagManager: React.FC<TagManagerProps> = ({ tags, isLoading, error }) => {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: deleteTag,
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
        description: `Failed to delete tag: ${error.message}`
      });
    }
  });
  
  const handleDeleteTag = (slug: string, name: string) => {
    if (confirm(`Are you sure you want to delete the tag "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(slug);
    }
  };
  
  if (isLoading) {
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
      
      <div className="rounded-md border">
        <div className="p-4 bg-muted/50">
          <div className="grid grid-cols-2 font-medium">
            <div>Name</div>
            <div className="text-right">Actions</div>
          </div>
        </div>
        
        <div className="divide-y">
          {tags.length > 0 ? (
            tags.map((tag) => (
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
