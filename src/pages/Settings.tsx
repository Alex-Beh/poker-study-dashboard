
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, tagsApi, youtubersApi } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryManager from '@/components/CategoryManager';
import YoutuberManager from '@/components/YoutuberManager';
import TagManager from '@/components/TagManager';
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft } from 'lucide-react'; 

const Settings = () => {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: tags, isLoading: tagsLoading, error: tagsError } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: youtubers, isLoading: youtubersLoading, error: youtubersError } = useQuery({
    queryKey: ['youtubers'],
    queryFn: youtubersApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (categoriesError || tagsError || youtubersError) {
    const errorMessage = 
      (categoriesError as Error)?.message || 
      (tagsError as Error)?.message || 
      (youtubersError as Error)?.message;
    
    toast({
      variant: "destructive",
      title: "Error loading data",
      description: errorMessage || "Failed to load settings data"
    });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Videos
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>

      <Tabs defaultValue="youtubers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="youtubers">Youtubers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="youtubers" className="mt-4">
          <YoutuberManager />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <TagManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
