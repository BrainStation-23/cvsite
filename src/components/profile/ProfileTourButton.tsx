
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Play } from 'lucide-react';

interface ProfileTourButtonProps {
  onStartTour: () => void;
}

export const ProfileTourButton: React.FC<ProfileTourButtonProps> = ({ onStartTour }) => {
  return (
    <Button
      variant="outline"
      onClick={onStartTour}
      className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 text-blue-700 hover:text-blue-800 transition-all duration-200"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Start Guided Tour</span>
      <span className="sm:hidden">Tour</span>
      <Play className="h-3 w-3 ml-1" />
    </Button>
  );
};
