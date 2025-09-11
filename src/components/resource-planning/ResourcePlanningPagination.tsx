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

const PER_PAGE_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

export const ResourcePlanningPagination: React.FC<ResourcePlanningPaginationProps> = ({
  pagination,
  currentPage,
  setCurrentPage,
  perPage,
  setPerPage,
}) => {

  const startIndex = (currentPage - 1) * perPage + 1;
  const endIndex = Math.min(currentPage * perPage, pagination.filtered_count);

  return (
    <>
      {pagination.filtered_count === 0
        ? ''
        : <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {pagination.filtered_count === 0
              ? "No entries available"
              : `Showing ${startIndex} to ${endIndex} of ${pagination.filtered_count} entries`}
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm" htmlFor="per-page-input">Rows per page:</label>
            <div className="relative">
              <input
                id="per-page-input"
                type="number"
                min={1}
                className="border rounded px-2 py-1 text-sm w-20 pr-6 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
                value={perPage}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (!isNaN(val) && val > 0) {
                    setPerPage(val);
                    setCurrentPage(1);
                  }
                }}
                list="per-page-options"
              />
              <select
                className="absolute right-0 top-0 h-full bg-transparent border-none text-gray-500 pr-2 cursor-pointer"
                style={{ width: 24 }}
                value=""
                onChange={e => {
                  const val = Number(e.target.value);
                  setPerPage(val);
                  setCurrentPage(1);
                }}
                tabIndex={-1}
              >
                <option value="" disabled hidden />
                {PER_PAGE_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
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
        </div>}

    </>
  );
};
