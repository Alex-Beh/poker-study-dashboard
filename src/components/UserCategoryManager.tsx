
import React, { useState } from 'react';
import { useUserCategories } from '@/contexts/UserCategoriesContext';
import { useCreator } from '@/contexts/CreatorContext'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const UserCategoryManager: React.FC = () => {
  const { userCategories, addCategory, editCategory, deleteCategory } = useUserCategories();
  const { selectedCreator } = useCreator();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
  
  const creatorCategories = selectedCreator
    ? userCategories.filter(category => category.creatorId === selectedCreator.id)
    : [];
  
  const handleAddCategory = () => {
    if (!selectedCreator) {
      toast({
        title: "No Creator Selected",
        description: "Please select a creator first.",
        variant: "destructive"
      });
      return;
    }
    
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim(), selectedCreator.id);
      setNewCategoryName('');
      setIsAddOpen(false);
      toast({
        title: "Category Added",
        description: `Category "${newCategoryName}" has been created.`
      });
    }
  };
  
  const handleEditCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      editCategory(editingCategory.id, editingCategory.name);
      setEditingCategory(null);
      setIsEditOpen(false);
      toast({
        title: "Category Updated",
        description: `Category has been renamed to "${editingCategory.name}".`
      });
    }
  };
  
  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      deleteCategory(id);
      toast({
        title: "Category Deleted",
        description: `Category "${name}" has been deleted.`
      });
    }
  };
  
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">My Categories</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {creatorCategories.length > 0 ? (
        <ul className="space-y-2">
          {creatorCategories.map(category => (
            <li key={category.id} className="flex items-center justify-between group">
              <span className="text-sm">{category.name}</span>
              <div className="flex space-x-1">
                <Dialog open={isEditOpen && editingCategory?.id === category.id} 
                       onOpenChange={(open) => {
                         setIsEditOpen(open);
                         if (!open) setEditingCategory(null);
                       }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => setEditingCategory({ id: category.id, name: category.name })}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input
                        placeholder="Category name"
                        value={editingCategory?.name || ''}
                        onChange={(e) => setEditingCategory(prev => 
                          prev ? { ...prev, name: e.target.value } : null
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                          setIsEditOpen(false);
                          setEditingCategory(null);
                        }}>
                          Cancel
                        </Button>
                        <Button onClick={handleEditCategory}>Save Changes</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No custom categories. Add one to get started!</p>
      )}
    </div>
  );
};

export default UserCategoryManager;
