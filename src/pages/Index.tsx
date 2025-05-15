
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import VideoGrid from '@/components/VideoGrid';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { UserCategoriesProvider } from '@/contexts/UserCategoriesContext';
import { CreatorProvider, useCreator } from '@/contexts/CreatorContext';
import { videosApi } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const IndexContent = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { selectedCreator } = useCreator();
  
  // Fetch all videos for the selected creator
  const { data: allVideos, isLoading: isLoadingAllVideos } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videosApi.getAll(),
    staleTime: 60000 // Keep data fresh for 1 minute
  });

  // Fetch specific creator videos when a creator is selected
  const { data: creatorVideos, isLoading: isLoadingCreatorVideos } = useQuery({
    queryKey: ['videos', 'creator', selectedCreator?.id],
    queryFn: () => selectedCreator ? videosApi.getByCreator(selectedCreator.id, 1) : Promise.resolve({ videos: [] }),
    enabled: !!selectedCreator,
    staleTime: 60000 // Keep data fresh for 1 minute
  });
  
  // Videos to display based on creator selection
  const videosToDisplay = selectedCreator && creatorVideos?.videos ? creatorVideos.videos : (allVideos || []);

  // Fetch paginated videos for the selected category
  const { 
    data: categoryData, 
    isLoading: isLoadingCategory,
    error 
  } = useQuery({
    queryKey: ['videos', 'category', selectedCategory, currentPage],
    queryFn: () => {
      if (!selectedCategory) {
        return Promise.resolve({
          videos: videosToDisplay,
          page: 1,
          limit: 20,
          total: videosToDisplay.length,
          total_pages: Math.ceil(videosToDisplay.length / 20)
        });
      }
      
      return videosApi.getByCategory(selectedCategory, currentPage);
    },
    enabled: !!selectedCategory || !!selectedCreator,
    staleTime: 60000 // Keep data fresh for 1 minute
  });
  
  // Extract videos and pagination info from the response
  const categoryVideos = categoryData?.videos || videosToDisplay;
  const totalPages = categoryData?.total_pages || 1;
  
  // Build category map from fetched videos
  const categoryMap = React.useMemo(() => {
    const videos = selectedCreator && creatorVideos?.videos ? creatorVideos.videos : (allVideos || []);
    if (!videos.length) return {};
    
    const map: Record<string, number[]> = {};
    videos.forEach(video => {
      if (video.categories) {
        const categoryList = Array.isArray(video.categories) ? video.categories : [video.categories];
        
        categoryList.forEach(category => {
          const categoryName = typeof category === 'string' ? category : 
                            (category && typeof category === 'object' && 'name' in category ? category.name : null);
          
          if (categoryName) {
            if (!map[categoryName]) {
              map[categoryName] = [];
            }
            const videoId = typeof video.video_id === 'string' ? parseInt(video.video_id) : video.video_id;
            map[categoryName].push(videoId);
          }
        });
      }
    });
    
    return map;
  }, [allVideos, creatorVideos, selectedCreator]);
  
  // Set initial category when data is loaded
  useEffect(() => {
    // When creator changes, reset the selected category
    setSelectedCategory("");
    setCurrentPage(1);
  }, [selectedCreator]);

  // Reset to page 1 when changing categories
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // Determine if we're still loading data
  const isLoading = isLoadingAllVideos || 
                    (isLoadingCreatorVideos && !!selectedCreator) || 
                    (isLoadingCategory && !!selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col p-4">
        <div className="h-14 mb-4">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md">
          <h2 className="text-lg font-bold">Error Loading Data</h2>
          <p>Failed to connect to the backend server. Make sure your Flask API is running on http://localhost:5000.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header videos={allVideos || []} />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <CategorySidebar
          categoryMap={categoryMap}
          videos={videosToDisplay}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <VideoGrid 
          videos={selectedCategory ? categoryVideos : videosToDisplay}
          categoryName={selectedCategory || (selectedCreator ? `All ${selectedCreator.name} Videos` : 'All Videos')}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ProgressProvider>
      <CreatorProvider>
        <UserCategoriesProvider>
          <IndexContent />
        </UserCategoriesProvider>
      </CreatorProvider>
    </ProgressProvider>
  );
};

export default Index;
