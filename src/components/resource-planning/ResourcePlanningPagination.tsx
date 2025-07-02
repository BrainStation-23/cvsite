
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

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.filtered_count)} of {pagination.filtered_count} entries
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
