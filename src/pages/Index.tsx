
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import VideoGrid from '@/components/VideoGrid';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { UserCategoriesProvider } from '@/contexts/UserCategoriesContext';
import { CreatorProvider, useCreator } from '@/contexts/CreatorContext';
import { fetchAllVideos, fetchCategoryVideos, fetchCreatorVideos } from '@/services/api';
import { Video } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserCategories } from '@/contexts/UserCategoriesContext';

const IndexContent = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { selectedCreator } = useCreator();
  const { userCategories } = useUserCategories();
  
  // Fetch all videos for categories
  const { data: allVideos, isLoading: isLoadingAllVideos } = useQuery({
    queryKey: ['videos', selectedCreator?.id],
    queryFn: fetchAllVideos
  });
  
  // Fetch paginated videos for the selected category or creator
  const { 
    data: categoryData, 
    isLoading: isLoadingCategory,
    error 
  } = useQuery({
    queryKey: ['videos', selectedCategory, currentPage, selectedCreator?.id],
    queryFn: () => {
      // Check if it's a user-defined category
      const userCategory = userCategories.find(c => 
        c.name === selectedCategory && (!selectedCreator || c.creatorId === selectedCreator.id)
      );
      
      if (userCategory) {
        // For user categories, filter all videos to get those in the category
        if (allVideos) {
          const filteredVideos = allVideos.filter(video => 
            userCategory.videoIds.includes(video.video_id)
          );
          
          // Manual pagination for user categories
          const total = filteredVideos.length;
          const limit = 12;
          const totalPages = Math.ceil(total / limit);
          const start = (currentPage - 1) * limit;
          const end = start + limit;
          const paginatedVideos = filteredVideos.slice(start, end);
          
          return Promise.resolve({
            videos: paginatedVideos,
            page: currentPage,
            limit,
            total,
            total_pages: totalPages
          });
        }
        return Promise.resolve({
          videos: [],
          page: 1,
          limit: 12,
          total: 0,
          total_pages: 1
        });
      }
      
      // For system categories or when no category is selected
      if (selectedCreator && !selectedCategory) {
        return fetchCreatorVideos(selectedCreator.id, currentPage);
      } else if (selectedCategory) {
        return fetchCategoryVideos(selectedCategory, currentPage);
      } else {
        return Promise.resolve({
          videos: [],
          page: 1,
          limit: 12,
          total: 0,
          total_pages: 1
        });
      }
    },
    enabled: !!selectedCategory || !!selectedCreator,
  });
  
  const categoryVideos = categoryData?.videos || [];
  const totalPages = categoryData?.total_pages || 1;
  
  // Build category map from fetched videos
  const categoryMap = React.useMemo(() => {
    if (!allVideos) return {};
    
    const map: Record<string, number[]> = {};
    allVideos.forEach(video => {
      if (video.categories) {
        video.categories.forEach(category => {
          if (!map[category]) {
            map[category] = [];
          }
          map[category].push(video.video_id);
        });
      }
    });
    
    // Add user categories to the map
    userCategories.forEach(category => {
      if (selectedCreator && category.creatorId === selectedCreator.id) {
        map[category.name] = category.videoIds;
      }
    });
    
    return map;
  }, [allVideos, userCategories, selectedCreator]);
  
  // Set initial category when data is loaded
  useEffect(() => {
    if (allVideos && allVideos.length > 0 && !selectedCategory) {
      // Get first category from the first video
      const firstVideo = allVideos[0];
      if (firstVideo.categories && firstVideo.categories.length > 0) {
        setSelectedCategory(firstVideo.categories[0]);
      }
    }
  }, [allVideos, selectedCategory]);

  // Reset to page 1 when changing categories or creators
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedCreator]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  const isLoading = isLoadingAllVideos || (isLoadingCategory && (!!selectedCategory || !!selectedCreator));

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
          videos={allVideos || []}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <VideoGrid 
          videos={categoryVideos}
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
