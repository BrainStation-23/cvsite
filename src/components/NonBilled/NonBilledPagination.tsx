import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PaginationData {
  total_count: number;
  filtered_count: number;
  page: number;
  per_page: number;
  page_count: number;
}

interface NonBilledPaginationProps {
  pagination: PaginationData;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export const NonBilledPagination: React.FC<NonBilledPaginationProps> = ({
  pagination,
  currentPage,
  perPage,
  onPageChange,
  onPerPageChange,
}) => {
  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value, 10);
    onPerPageChange(newPerPage);
    onPageChange(1); // Reset to first page when changing per page
  };

  const startEntry = pagination.filtered_count > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const endEntry = Math.min(currentPage * perPage, pagination.filtered_count);

  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.page_count;
    const current = currentPage;
    
    // Always show first page
    if (totalPages > 0) {
      pages.push(1);
    }
    
    // Show pages around current page
    const start = Math.max(2, current - 1);
    const end = Math.min(totalPages - 1, current + 1);
    
    // Add ellipsis if there's a gap
    if (start > 2) {
      pages.push('...');
    }
    
    // Add middle pages
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }
    
    // Add ellipsis if there's a gap
    if (end < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">
          Showing {startEntry} to {endEntry} of {pagination.filtered_count} entries
          {pagination.filtered_count !== pagination.total_count && (
            <span className="text-muted-foreground"> (filtered from {pagination.total_count} total)</span>
          )}
        </p>
      </div>
      
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Per page:</Label>
          <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={perPage} />
            </SelectTrigger>
            <SelectContent side="top">
              {PER_PAGE_OPTIONS.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {pagination.page_count > 1 && (
          <div className="flex items-center space-x-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {generatePageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === '...' ? (
                      <span className="px-4 py-2">...</span>
                    ) : (
                      <PaginationLink
                        onClick={() => onPageChange(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPageChange(Math.min(pagination.page_count, currentPage + 1))}
                    className={currentPage === pagination.page_count ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};