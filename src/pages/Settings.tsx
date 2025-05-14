
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import YoutuberManager from '@/components/YoutuberManager';
import CategoryManager from '@/components/CategoryManager';
import TagManager from '@/components/TagManager';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  // We'll reuse the categories query
  const { data: categoryResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });
  
  // In a real application, we'd fetch tags from the API
  // For now, we'll use an empty array or mock data
  const tags = [];
  const isLoadingTags = false;
  const tagsError = null;
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="youtubers">
        <TabsList className="mb-8">
          <TabsTrigger value="youtubers">Youtubers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        
        <TabsContent value="youtubers">
          <YoutuberManager />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
        
        <TabsContent value="tags">
          <TagManager tags={tags} isLoading={isLoadingTags} error={tagsError} />
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="bg-muted/20 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">About</h2>
        <p>Poker Training Tracker helps you organize and track your poker training videos across multiple creators.</p>
      </div>
    </div>
  );
};

export default Settings;
