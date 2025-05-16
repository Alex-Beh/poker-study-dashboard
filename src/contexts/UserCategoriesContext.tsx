
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface UserCategoriesContextType {
  userCategories: UserCategory[];
  addCategory: (name: string, creatorId: string) => void;
  editCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  assignVideoToCategory: (categoryId: string, videoId: number) => void;
  unassignVideoFromCategory: (categoryId: string, videoId: number) => void;
  getCategoriesForCreator: (creatorId: string) => UserCategory[];
  isVideoInCategory: (categoryId: string, videoId: number) => boolean;
}

const UserCategoriesContext = createContext<UserCategoriesContextType>({
  userCategories: [],
  addCategory: () => {},
  editCategory: () => {},
  deleteCategory: () => {},
  assignVideoToCategory: () => {},
  unassignVideoFromCategory: () => {},
  getCategoriesForCreator: () => [],
  isVideoInCategory: () => false,
});

export const useUserCategories = () => useContext(UserCategoriesContext);

interface UserCategoriesProviderProps {
  children: ReactNode;
}

export const UserCategoriesProvider: React.FC<UserCategoriesProviderProps> = ({ children }) => {
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);

  const addCategory = (name: string, creatorId: string) => {
    setUserCategories(prevCategories => [
      ...prevCategories,
      { id: uuidv4(), name, creatorId, videoIds: [] }
    ]);
  };

  const editCategory = (id: string, name: string) => {
    setUserCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === id ? { ...category, name } : category
      )
    );
  };

  const deleteCategory = (id: string) => {
    setUserCategories(prevCategories => 
      prevCategories.filter(category => category.id !== id)
    );
  };

  const assignVideoToCategory = (categoryId: string, videoId: number) => {
    setUserCategories(prevCategories => 
      prevCategories.map(category => {
        if (category.id === categoryId && !category.videoIds.includes(videoId)) {
          return { ...category, videoIds: [...category.videoIds, videoId] };
        }
        return category;
      })
    );
  };

  const unassignVideoFromCategory = (categoryId: string, videoId: number) => {
    setUserCategories(prevCategories => 
      prevCategories.map(category => {
        if (category.id === categoryId) {
          return { 
            ...category, 
            videoIds: category.videoIds.filter(id => id !== videoId) 
          };
        }
        return category;
      })
    );
  };

  const getCategoriesForCreator = (creatorId: string) => {
    return userCategories.filter(category => category.creatorId === creatorId);
  };

  const isVideoInCategory = (categoryId: string, videoId: number) => {
    const category = userCategories.find(c => c.id === categoryId);
    return category ? category.videoIds.includes(videoId) : false;
  };

  return (
    <UserCategoriesContext.Provider
      value={{
        userCategories,
        addCategory,
        editCategory,
        deleteCategory,
        assignVideoToCategory,
        unassignVideoFromCategory,
        getCategoriesForCreator,
        isVideoInCategory
      }}
    >
      {children}
    </UserCategoriesContext.Provider>
  );
};
