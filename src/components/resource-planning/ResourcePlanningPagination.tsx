
import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationData {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

interface ResourcePlanningPaginationProps {
  pagination: PaginationData;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const ResourcePlanningPagination: React.FC<ResourcePlanningPaginationProps> = ({
  pagination,
  currentPage,
  setCurrentPage,
}) => {
  if (!pagination || pagination.page_count <= 1) {
    return null;
  }

  const startIndex = (currentPage - 1) * pagination.per_page + 1;
  const endIndex = Math.min(currentPage * pagination.per_page, pagination.filtered_count);

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex} to {endIndex} of {pagination.filtered_count} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {pagination.page_count}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === pagination.page_count}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
