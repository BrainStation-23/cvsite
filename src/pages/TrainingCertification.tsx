import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { useCertificationsSearch } from '@/hooks/use-certifications-search';
import { CertificationSearchFilters } from '@/components/admin/training-certification/CertificationSearchFilters';
import { CertificationTable } from '@/components/admin/training-certification/CertificationTable';
import { TrainingBulkUploadDialog } from '@/components/admin/training-certification/TrainingBulkUploadDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CertificationExportButton } from '@/components/admin/training-certification/CertificateExportButton';
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
    handleClearFilters,
    refetch
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
      pages.push(<PaginationItem key={i}>
          <PaginationLink onClick={() => handlePageChange(i)} isActive={currentPage === i} className="cursor-pointer">
            {i}
          </PaginationLink>
        </PaginationItem>);
    }
    return <Pagination>
        <PaginationContent>
          {currentPage > 1 && <PaginationItem>
              <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className="cursor-pointer" />
            </PaginationItem>}
          {pages}
          {currentPage < pagination.page_count && <PaginationItem>
              <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className="cursor-pointer" />
            </PaginationItem>}
        </PaginationContent>
      </Pagination>;
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training & Certifications</h1>
            <p className="text-gray-600 mt-1">Manage and track employee certifications</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-9"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <TrainingBulkUploadDialog onUploadComplete={refetch} />
            <CertificationExportButton />
          </div>
        </div>

        {/* Search and Filters */}
        <CertificationSearchFilters
          searchQuery={searchQuery}
          providerFilter={providerFilter}
          sbuFilter={sbuFilter}
          onSearchChange={handleSearch}
          onProviderFilterChange={handleProviderFilter}
          onSbuFilterChange={handleSbuFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Results Section */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Certifications
                </CardTitle>
                {!isLoading && (
                  <p className="text-sm text-gray-500 mt-1">
                    Showing {pagination.filtered_count} of {pagination.total_count} certifications
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Show:</span>
                <Select 
                  value={itemsPerPage.toString()} 
                  onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
                >
                  <SelectTrigger className="w-20 h-8 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
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
                  <div className="p-4 border-t bg-gray-50/50">
                    <div className="flex justify-center">
                      {renderPagination()}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingCertification;
