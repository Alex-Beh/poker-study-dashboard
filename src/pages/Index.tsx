
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
import { toast } from '@/components/ui/use-toast';

const IndexContent = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { selectedCreator } = useCreator();
  
  // Fetch all videos for reference
  const { data: allVideos, isLoading: isLoadingAllVideos } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videosApi.getAll(),
    staleTime: 60000 // Keep data fresh for 1 minute
  });

  // Fetch specific creator videos when a creator is selected
  const { data: creatorVideos, isLoading: isLoadingCreatorVideos } = useQuery({
    queryKey: ['videos', 'creator', selectedCreator?.id],
    queryFn: () => selectedCreator ? videosApi.getByCreator(selectedCreator.id) : Promise.resolve({ videos: [] }),
    enabled: !!selectedCreator,
    staleTime: 60000 // Keep data fresh for 1 minute
  });
  
  // Videos to display based on creator selection
  const currentCreatorVideos = selectedCreator && creatorVideos?.videos ? creatorVideos.videos : (allVideos || []);
  
  // Build category map from current creator videos
  const categoryMap = React.useMemo(() => {
    const videos = currentCreatorVideos;
    if (!videos || videos.length === 0) return {};
    
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
            const videoId = typeof video.video_id === 'string' ? parseInt(video.video_id, 10) : video.video_id;
            if (!isNaN(videoId) && !map[categoryName].includes(videoId)) {
              map[categoryName].push(videoId);
            }
          }
        });
      }
    });
    
    return map;
  }, [currentCreatorVideos]);
  
  // Filter videos by selected category
  const categoryVideos = React.useMemo(() => {
    if (!selectedCategory || selectedCategory === '') {
      return currentCreatorVideos;
    }
    
    const categoryIds = categoryMap[selectedCategory] || [];
    return currentCreatorVideos.filter(video => {
      const videoId = typeof video.video_id === 'string' ? parseInt(video.video_id, 10) : video.video_id;
      return categoryIds.includes(videoId);
    });
  }, [currentCreatorVideos, selectedCategory, categoryMap]);
  
  // Set initial category when data is loaded
  useEffect(() => {
    // When creator changes, reset the selected category
    setSelectedCategory("");
    setCurrentPage(1);
  }, [selectedCreator]);

  // Reset to page 1 when changing categories
  useEffect(() => {
    setCurrentPage(1);
    // Log for debugging
    console.log("Selected category changed to:", selectedCategory);
    console.log("Videos for category:", categoryVideos.length);
  }, [selectedCategory]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // Calculate pagination info
  const itemsPerPage = 12;
  const totalVideos = categoryVideos.length;
  const totalPages = Math.ceil(totalVideos / itemsPerPage);
  
  // Get current page videos
  const currentVideos = categoryVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Determine if we're still loading data
  const isLoading = isLoadingAllVideos || (isLoadingCreatorVideos && !!selectedCreator);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header videos={allVideos || []} />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <CategorySidebar
          categoryMap={categoryMap}
          videos={currentCreatorVideos}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <VideoGrid 
          videos={currentVideos}
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
