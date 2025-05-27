
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ReferencePaginationProps {
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

const ReferencePagination: React.FC<ReferencePaginationProps> = ({
  pagination,
  currentPage,
  onPageChange
}) => {
  const { total_count, filtered_count, page_count } = pagination;

  if (page_count <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = page_count > 7;
    
    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= page_count; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show ellipsis for large page counts
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => onPageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        pages.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(page_count - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < page_count - 2) {
        pages.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      if (page_count > 1) {
        pages.push(
          <PaginationItem key={page_count}>
            <PaginationLink
              onClick={() => onPageChange(page_count)}
              isActive={currentPage === page_count}
              className="cursor-pointer"
            >
              {page_count}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {((currentPage - 1) * pagination.per_page) + 1} to{' '}
        {Math.min(currentPage * pagination.per_page, filtered_count)} of{' '}
        {filtered_count} references
        {total_count !== filtered_count && ` (filtered from ${total_count} total)`}
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
            />
          </PaginationItem>
          
          {renderPageNumbers()}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(page_count, currentPage + 1))}
              className={`cursor-pointer ${currentPage === page_count ? 'pointer-events-none opacity-50' : ''}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ReferencePagination;
