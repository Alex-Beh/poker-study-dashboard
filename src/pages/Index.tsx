
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
  
  // Fetch all videos for reference
  const { data: allVideos, isLoading: isLoadingAllVideos } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videosApi.getAll(),
    staleTime: 30000 // Keep data fresh for 30 seconds
  });

  // Fetch specific creator videos when a creator is selected
  const { data: creatorVideos, isLoading: isLoadingCreatorVideos } = useQuery({
    queryKey: ['videos', 'creator', selectedCreator?.id],
    queryFn: () => selectedCreator ? videosApi.getByCreator(selectedCreator.id) : Promise.resolve({ videos: [], page: 1, limit: 100, total: 0, total_pages: 1 }),
    enabled: !!selectedCreator,
    staleTime: 30000 // Keep data fresh for 30 seconds
  });
  
  // Videos to display based on creator selection
  const currentCreatorVideos = selectedCreator && creatorVideos?.videos ? creatorVideos.videos : (allVideos || []);
  
  // Sort videos by ID to maintain consistent ordering
  const sortedVideos = React.useMemo(() => {
    if (!currentCreatorVideos.length) return [];
    
    return [...currentCreatorVideos].sort((a, b) => {
      const idA = a.id ? Number(a.id) : 0;
      const idB = b.id ? Number(b.id) : 0;
      return idA - idB;
    });
  }, [currentCreatorVideos]);
  
  // Build category map from current creator videos using id as the key
  const categoryMap = React.useMemo(() => {
    const videos = sortedVideos;
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
            
            const videoId = video.id ? Number(video.id) : null;
            if (videoId !== null && !map[categoryName].includes(videoId)) {
              map[categoryName].push(videoId);
            }
          }
        });
      }
    });
    
    return map;
  }, [sortedVideos]);
  
  // Filter videos by selected category
  const categoryVideos = React.useMemo(() => {
    if (!selectedCategory || selectedCategory === '') {
      return sortedVideos;
    }
    
    const categoryIds = categoryMap[selectedCategory] || [];
    return sortedVideos.filter(video => {
      const videoId = video.id ? Number(video.id) : null;
      return videoId !== null && categoryIds.includes(videoId);
    });
  }, [sortedVideos, selectedCategory, categoryMap]);
  
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
          videos={sortedVideos}
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
