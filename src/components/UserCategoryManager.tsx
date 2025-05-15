
import React, { useState } from 'react';
import { useCreator } from '@/contexts/CreatorContext';
import { useUserCategories } from '@/contexts/UserCategoriesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserCategoryManager = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const { selectedCreator } = useCreator();
  const { userCategories, addCategory, deleteCategory } = useUserCategories();
  const { toast } = useToast();

  // Filter categories for the selected creator
  const creatorCategories = userCategories.filter(category => 
    selectedCreator && category.creatorId === selectedCreator.id.toString()
  );

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCreator) {
      toast({
        variant: 'destructive',
        title: 'No Creator Selected',
        description: 'Please select a creator first.'
      });
      return;
    }
    
    if (newCategoryName.trim()) {
      // Check if category with this name already exists for this creator
      const exists = creatorCategories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase());
      
      if (exists) {
        toast({
          variant: 'destructive',
          title: 'Category Already Exists',
          description: `A category named "${newCategoryName}" already exists for this creator.`
        });
        return;
      }
      
      // Add the new category
      addCategory(newCategoryName.trim(), selectedCreator.id.toString());
      setNewCategoryName('');
      
      toast({
        title: 'Category Added',
        description: `"${newCategoryName}" has been added to your categories.`
      });
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    deleteCategory(categoryId);
    toast({
      title: 'Category Removed',
      description: 'The category has been removed.'
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Custom Categories</h2>
      
      <form onSubmit={handleAddCategory} className="flex space-x-2">
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name"
          className="flex-1"
          disabled={!selectedCreator}
        />
        <Button type="submit" disabled={!newCategoryName.trim() || !selectedCreator}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </form>
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Your Categories</h3>
        {!selectedCreator ? (
          <p className="text-muted-foreground">Select a creator to manage categories</p>
        ) : creatorCategories.length > 0 ? (
          <ul className="space-y-2">
            {creatorCategories.map((category) => (
              <li key={category.id} className="flex items-center justify-between p-2 bg-secondary rounded">
                <span>{category.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCategory(category.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">
            No custom categories for {selectedCreator.name}. Create your first category above.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserCategoryManager;
