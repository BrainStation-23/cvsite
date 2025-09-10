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
  perPage: number;
  setPerPage: (perPage: number) => void;
}

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

export const ResourcePlanningPagination: React.FC<ResourcePlanningPaginationProps> = ({
  pagination,
  currentPage,
  setCurrentPage,
  perPage,
  setPerPage,
}) => {
  if (!pagination || pagination.page_count <= 1) {
    return null;
  }

  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(currentPage * perPage, pagination.filtered_count);

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex} to {endIndex} of {pagination.filtered_count} entries
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-sm" htmlFor="per-page-select">Rows per page:</label>
        <select
          id="per-page-select"
          className="border rounded px-2 py-1 text-sm"
          value={perPage}
          onChange={e => {
            setPerPage(Number(e.target.value)); // update perPage
            setCurrentPage(1); // reset to first page
          }}
        >
          {PER_PAGE_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
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
