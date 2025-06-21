
import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCertificationsSearch } from '@/hooks/use-certifications-search';
import { CertificationSearchFilters } from '@/components/admin/training-certification/CertificationSearchFilters';
import { CertificationTable } from '@/components/admin/training-certification/CertificationTable';
import { Skeleton } from '@/components/ui/skeleton';

const TrainingCertification: React.FC = () => {
  const {
    certifications,
    pagination,
    isLoading,
    searchQuery,
    providerFilter,
    sbuFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
    handleSearch,
    handleProviderFilter,
    handleSbuFilter,
    handleSort,
    handlePageChange,
    handleItemsPerPageChange,
    handleClearFilters
  } = useCertificationsSearch();

  const renderPagination = () => {
    if (pagination.page_count <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(pagination.page_count, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
          {pages}
          {currentPage < pagination.page_count && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(currentPage + 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Training & Certifications</h1>
            <p className="text-gray-600 mt-1">
              Manage and view all employee training and certifications
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <CertificationSearchFilters
              searchQuery={searchQuery}
              providerFilter={providerFilter}
              sbuFilter={sbuFilter}
              onSearchChange={handleSearch}
              onProviderFilterChange={handleProviderFilter}
              onSbuFilterChange={handleSbuFilter}
              onClearFilters={handleClearFilters}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Certifications 
                {!isLoading && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({pagination.filtered_count} of {pagination.total_count})
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Show:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                <CertificationTable
                  certifications={certifications}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                
                {pagination.page_count > 1 && (
                  <div className="mt-6 flex justify-center">
                    {renderPagination()}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TrainingCertification;
