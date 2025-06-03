
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SbuPaginationProps {
  pagination: {
    total_count: number;
    filtered_count: number;
    page: number;
    per_page: number;
    page_count: number;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
}

const SbuPagination: React.FC<SbuPaginationProps> = ({
  pagination,
  currentPage,
  onPageChange
}) => {
  if (pagination.page_count <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing {((currentPage - 1) * pagination.per_page) + 1} to {Math.min(currentPage * pagination.per_page, pagination.filtered_count)} of {pagination.filtered_count} SBUs
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <span className="text-sm">
          Page {currentPage} of {pagination.page_count}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pagination.page_count}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SbuPagination;
