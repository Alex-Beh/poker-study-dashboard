
import React, { useEffect } from 'react';
import { useCreator } from '@/contexts/CreatorContext';
import { youtubersApi } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const CreatorDropdown: React.FC = () => {
  const { selectedCreator, setSelectedCreator, creators, setCreators } = useCreator();
  const queryClient = useQueryClient();
  
  const { data: youtubers, isLoading } = useQuery({
    queryKey: ['youtubers'],
    queryFn: youtubersApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  useEffect(() => {
    if (youtubers && youtubers.length > 0) {
      setCreators(youtubers);
      
      // If no creator is selected yet, select the first one
      if (!selectedCreator) {
        setSelectedCreator(youtubers[0]);
      }
    }
  }, [youtubers, selectedCreator, setCreators, setSelectedCreator]);
  
  const handleCreatorChange = (creatorId: string) => {
    const creator = creators.find(c => c.id.toString() === creatorId);
    if (creator) {
      setSelectedCreator(creator);
      
      // Invalidate videos query to force refetch with new creator
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    }
  };
  
  if (isLoading || !selectedCreator) {
    return (
      <div className="w-48 h-10 bg-muted animate-pulse rounded"></div>
    );
  }
  
  return (
    <Select 
      value={selectedCreator.id.toString()} 
      onValueChange={handleCreatorChange}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select creator" />
      </SelectTrigger>
      <SelectContent>
        {creators.map(creator => (
          <SelectItem key={creator.id} value={creator.id.toString()}>
            {creator.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CreatorDropdown;
