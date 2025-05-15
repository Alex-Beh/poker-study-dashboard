
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, tagsApi } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import YoutuberManager from '@/components/YoutuberManager';
import CategoryManager from '@/components/CategoryManager';
import TagManager from '@/components/TagManager';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll
  });
  
  // Fetch tags
  const { data: tags, isLoading: isLoadingTags, error: tagsError } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll
  });
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
      
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
          <TagManager 
            tags={tags || []} 
            isLoading={isLoadingTags} 
            error={tagsError as Error | null} 
          />
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
