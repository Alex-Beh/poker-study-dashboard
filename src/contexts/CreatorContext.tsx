
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Creator } from '@/types';

interface CreatorContextType {
  selectedCreator: Creator | null;
  creators: Creator[];
  setSelectedCreator: (creator: Creator) => void;
  setCreators: (creators: Creator[]) => void;
}

const CreatorContext = createContext<CreatorContextType>({
  selectedCreator: null,
  creators: [],
  setSelectedCreator: () => {},
  setCreators: () => {},
});

export const useCreator = () => useContext(CreatorContext);

interface CreatorProviderProps {
  children: ReactNode;
}

export const CreatorProvider: React.FC<CreatorProviderProps> = ({ children }) => {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);

  // Load selected creator from localStorage
  useEffect(() => {
    const savedCreator = localStorage.getItem('selectedCreator');
    if (savedCreator) {
      try {
        setSelectedCreator(JSON.parse(savedCreator));
      } catch (error) {
        console.error('Error parsing selected creator:', error);
      }
    }
  }, []);

  // Save selected creator to localStorage when it changes
  useEffect(() => {
    if (selectedCreator) {
      localStorage.setItem('selectedCreator', JSON.stringify(selectedCreator));
    }
  }, [selectedCreator]);

  return (
    <CreatorContext.Provider
      value={{
        selectedCreator,
        creators,
        setSelectedCreator,
        setCreators,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
};
