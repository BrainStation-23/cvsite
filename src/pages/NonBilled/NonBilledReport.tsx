import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { NonBilledFilters } from '@/components/NonBilled/NonBilled';
import { NonBilledTable } from '@/components/NonBilled/NonBilledTable';
import { NonBilledPagination } from '@/components/NonBilled/NonBilledPagination';
import { useNonBilledData } from '@/hooks/use-non-billed-data';
import { useNonBilledExport } from '@/hooks/use-non-billed-export';  
export const NonBilledReport: React.FC = () => {
  const {
    // Data
    nonBilledRecords,
    pagination,
    isLoading,
    error,
    refetch,
    
    // Filters
    searchQuery,
    setSearchQuery,
    selectedSbus,
    setSelectedSbus,
    selectedExpertises,
    setSelectedExpertises,
    selectedBillTypes,
    setSelectedBillTypes,
    clearFilters,
    
    // Pagination and sorting
    currentPage,
    setCurrentPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    perPage,
    setPerPage,
    
    // Actions
    syncNonBilled,
    isSyncing,
  } = useNonBilledData();
  const { exportNonBilled, isExporting } = useNonBilledExport();
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Non-Billed Report</h2>
            <p className="text-muted-foreground">View and analyze non-billed resources</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">Error loading non-billed data: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Non-Billed Report</h2>
          <p className="text-muted-foreground">View and analyze non-billed resources</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => syncNonBilled()}
            disabled={isSyncing}
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Non-Billed Now'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || nonBilledRecords.length === 0}
            onClick={() => exportNonBilled()}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <NonBilledFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSbus={selectedSbus}
        setSelectedSbus={setSelectedSbus}
        selectedExpertises={selectedExpertises}
        setSelectedExpertises={setSelectedExpertises}
        selectedBillTypes={selectedBillTypes}
        setSelectedBillTypes={setSelectedBillTypes}
        clearFilters={clearFilters}
      />

      {/* Table */}
      <NonBilledTable
        nonBilledRecords={nonBilledRecords}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Pagination */}
      {pagination && (
        <NonBilledPagination
          pagination={pagination}
          currentPage={currentPage}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={setPerPage}
        />
      )}
    </div>
  );
};

export default NonBilledReport;
