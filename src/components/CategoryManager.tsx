
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, deleteCategory } from '@/services/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CategoryManager: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: categoryResponse, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });
  
  const categories = categoryResponse?.data || [];
  
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Category Deleted",
        description: "Category successfully deleted"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: `Failed to delete category: ${error.message}`
      });
    }
  });
  
  const handleDeleteCategory = (slug: string, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"? This cannot be undone.`)) {
      deleteMutation.mutate(slug);
    }
  };
  
  if (isLoading) {
    return <div className="p-4 animate-pulse bg-muted rounded">Loading categories...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 text-destructive bg-destructive/10 rounded">
        <p>Error loading categories: {(error as Error).message}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Manage Categories</h2>
      
      <div className="rounded-md border">
        <div className="p-4 bg-muted/50">
          <div className="grid grid-cols-3 font-medium">
            <div>Name</div>
            <div>Videos</div>
            <div className="text-right">Actions</div>
          </div>
        </div>
        
        <div className="divide-y">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.slug} className="p-4 grid grid-cols-3 items-center">
                <div>{category.name}</div>
                <div>{category.count}</div>
                <div className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.slug, category.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
