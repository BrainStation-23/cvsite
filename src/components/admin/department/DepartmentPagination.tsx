
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationInfo {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

interface DepartmentPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isLoading: boolean;
}

const DepartmentPagination: React.FC<DepartmentPaginationProps> = ({
  pagination,
  onPageChange,
  onPerPageChange,
  isLoading
}) => {
  const { page, page_count, total_count, filtered_count, per_page } = pagination;

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < page_count) {
      onPageChange(page + 1);
    }
  };

  const startItem = (page - 1) * per_page + 1;
  const endItem = Math.min(page * per_page, filtered_count);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {filtered_count} entries
        {total_count !== filtered_count && ` (filtered from ${total_count} total)`}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={page <= 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="text-sm">
          Page {page} of {page_count}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={page >= page_count || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DepartmentPagination;
