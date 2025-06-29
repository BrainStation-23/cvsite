
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicSearchBar from './BasicSearchBar';
import AISearchBar from './AISearchBar';
import SortControls from './SortControls';
import { EmployeeProfileSortColumn, EmployeeProfileSortOrder } from '@/hooks/types/employee-profiles';

interface StickySearchHeaderProps {
  searchMode: 'manual' | 'ai';
  setSearchMode: (mode: 'manual' | 'ai') => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  onAISearch: (filters: any) => void;
  sortBy: EmployeeProfileSortColumn;
  sortOrder: EmployeeProfileSortOrder;
  onSortChange: (column: EmployeeProfileSortColumn, order: EmployeeProfileSortOrder) => void;
  onToggleFilters: () => void;
  isLoading: boolean;
  filtersOpen: boolean;
}

const StickySearchHeader: React.FC<StickySearchHeaderProps> = ({
  searchMode,
  setSearchMode,
  searchQuery,
  onSearch,
  onAISearch,
  sortBy,
  sortOrder,
  onSortChange,
  onToggleFilters,
  isLoading,
  filtersOpen
}) => {
  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b shadow-sm">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left side - Search */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant={filtersOpen ? "default" : "outline"}
                size="sm"
                onClick={onToggleFilters}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'manual' | 'ai')} className="flex-1">
                <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
                  <TabsTrigger value="manual" className="flex items-center gap-2 text-xs">
                    <Filter className="h-3 w-3" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-2 text-xs">
                    <Sparkles className="h-3 w-3" />
                    AI Search
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'manual' | 'ai')}>
              <TabsContent value="manual" className="mt-0">
                <BasicSearchBar
                  searchQuery={searchQuery}
                  onSearch={onSearch}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="ai" className="mt-0">
                <AISearchBar
                  onAISearch={onAISearch}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right side - Sort Controls */}
          <div className="flex-shrink-0">
            <SortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickySearchHeader;
