
import React, { useEffect } from 'react';
import { useCreator } from '@/contexts/CreatorContext';
import { fetchCreators } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const CreatorDropdown: React.FC = () => {
  const { selectedCreator, setSelectedCreator, creators, setCreators } = useCreator();
  
  const { data: fetchedCreators, isLoading } = useQuery({
    queryKey: ['creators'],
    queryFn: fetchCreators,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  useEffect(() => {
    if (fetchedCreators && fetchedCreators.length > 0) {
      setCreators(fetchedCreators);
      
      // If no creator is selected yet, select the first one
      if (!selectedCreator) {
        setSelectedCreator(fetchedCreators[0]);
      }
    }
  }, [fetchedCreators, selectedCreator, setCreators, setSelectedCreator]);
  
  const handleCreatorChange = (creatorId: string) => {
    const creator = creators.find(c => c.id === creatorId);
    if (creator) {
      setSelectedCreator(creator);
    }
  };
  
  if (isLoading || !selectedCreator) {
    return (
      <div className="w-48 h-10 bg-muted animate-pulse rounded"></div>
    );
  }
  
  return (
    <Select 
      value={selectedCreator.id} 
      onValueChange={handleCreatorChange}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select creator" />
      </SelectTrigger>
      <SelectContent>
        {creators.map(creator => (
          <SelectItem key={creator.id} value={creator.id}>
            {creator.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CreatorDropdown;
