
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ResourcePlanningSearchControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ResourcePlanningSearchControls: React.FC<ResourcePlanningSearchControlsProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees, projects, or resource types..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
};
