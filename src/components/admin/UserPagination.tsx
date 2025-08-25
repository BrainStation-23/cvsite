
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PaginationData } from '@/hooks/use-user-management';

interface UserPaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  isLoading: boolean;
}

const UserPagination: React.FC<UserPaginationProps> = ({
  pagination,
  onPageChange,
  onPerPageChange,
  isLoading
}) => {
  const { page, perPage, filteredCount, pageCount } = pagination;
  
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (pageCount <= 7) {
      // Show all pages if there are 7 or fewer
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      if (page > 3) {
        pages.push('ellipsis');
      }
      
      // Show pages around current page
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(pageCount - 1, page + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (page < pageCount - 2) {
        pages.push('ellipsis');
      }
      
      // Always include last page
      if (pageCount > 1) {
        pages.push(pageCount);
      }
    }
    
    return pages;
  };
  
  if (pageCount <= 1) {
    return null;
  }
  
  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {Math.min(filteredCount, (page - 1) * perPage + 1)}-
        {Math.min(page * perPage, filteredCount)} of {filteredCount} users
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
          <Select
            value={perPage.toString()}
            onValueChange={(value) => onPerPageChange(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(page - 1)}
                className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                aria-disabled={page <= 1}
              />
            </PaginationItem>
            
            {getPageNumbers().map((pageNum, index) => 
              pageNum === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === page}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(page + 1)}
                className={page >= pageCount ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                aria-disabled={page >= pageCount}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default UserPagination;
