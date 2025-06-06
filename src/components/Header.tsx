
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProgress } from '@/contexts/ProgressContext';
import { useCreator } from '@/contexts/CreatorContext';
import { Video } from '@/types';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import CreatorDropdown from './CreatorDropdown';
import { Settings } from 'lucide-react';

interface HeaderProps {
  videos: Video[];
}

const Header: React.FC<HeaderProps> = ({ videos }) => {
  const { watchedVideos, resetProgress, exportProgress, importProgress } = useProgress();
  const { selectedCreator } = useCreator();
  const [importText, setImportText] = React.useState('');
  
  // Filter videos by selected creator if applicable
  const filteredVideos = useMemo(() => {
    if (!selectedCreator) return videos;
    return videos.filter(v => {
      const creatorId = v.youtuber_id || v.creator_id;
      return creatorId === selectedCreator.id || creatorId === String(selectedCreator.id);
    });
  }, [videos, selectedCreator]);
  
  // Count total videos with valid IDs
  const totalVideos = useMemo(() => {
    return new Set(filteredVideos
      .map(v => v.id ? Number(v.id) : null)
      .filter(id => id !== null)
    ).size;
  }, [filteredVideos]);
  
  // Count watched videos from server data and local state
  const watchedCount = useMemo(() => {
    // Count videos marked as watched on the server
    const serverWatchedCount = filteredVideos.filter(v => v.watched).length;
    
    // Count videos that are marked as watched locally but not on the server
    const localWatchedCount = [...watchedVideos].filter(id => 
      filteredVideos.some(v => {
        const videoId = v.id ? Number(v.id) : null;
        return videoId === id && !v.watched;
      })
    ).length;
    
    return serverWatchedCount + localWatchedCount;
  }, [watchedVideos, filteredVideos]);
  
  const overallProgress = useMemo(() => {
    return totalVideos > 0 ? (watchedCount / totalVideos) * 100 : 0;
  }, [totalVideos, watchedCount]);

  const handleReset = () => {
    resetProgress();
  };

  const handleExport = () => {
    const data = exportProgress();
    navigator.clipboard.writeText(data);
    toast({
      title: "Progress Exported",
      description: "Progress data copied to clipboard.",
    });
  };

  const handleImport = () => {
    try {
      importProgress(importText);
      toast({
        title: "Progress Imported",
        description: "Your progress has been successfully updated.",
      });
      setImportText('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Invalid format. Please check your import data.",
      });
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b p-4 mb-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">Poker Training Tracker</h1>
              <CreatorDropdown />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Progress value={overallProgress} className="h-2 flex-1" />
              <span className="text-sm font-medium whitespace-nowrap">
                {watchedCount} / {totalVideos} ({Math.round(overallProgress)}%)
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Import/Export</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import/Export Progress</DialogTitle>
                  <DialogDescription>
                    Backup your progress or restore from a previous export.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Export Progress</h4>
                    <Button onClick={handleExport} size="sm">Copy to Clipboard</Button>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Import Progress</h4>
                    <div className="flex gap-2">
                      <Input 
                        value={importText} 
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder="Paste exported data here..."
                        className="flex-1"
                      />
                      <Button onClick={handleImport} size="sm" disabled={!importText}>Import</Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleReset}
            >
              Reset Progress
            </Button>
            
            <Button 
              variant="secondary" 
              size="sm"
              asChild
            >
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
