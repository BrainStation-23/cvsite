import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { BenchFilters } from '@/components/bench/BenchFilters';
import { BenchTable } from '@/components/bench/BenchTable';
import { BenchPagination } from '@/components/bench/BenchPagination';
import { useBenchData } from '@/hooks/use-bench-data';

export const BenchReport: React.FC = () => {
  const {
    // Data
    benchRecords,
    pagination,
    isLoading,
    error,
    refetch,
    
    // Filters
    searchQuery,
    setSearchQuery,
    selectedSbu,
    setSelectedSbu,
    selectedExpertise,
    setSelectedExpertise,
    selectedBillType,
    setSelectedBillType,
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
    syncBench,
    isSyncing,
  } = useBenchData();

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
            <h2 className="text-2xl font-bold tracking-tight">Bench Report</h2>
            <p className="text-muted-foreground">View and analyze bench utilization and resources</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">Error loading bench data: {error.message}</p>
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
          <h2 className="text-2xl font-bold tracking-tight">Bench Report</h2>
          <p className="text-muted-foreground">View and analyze bench utilization and resources</p>
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
            onClick={() => syncBench()}
            disabled={isSyncing}
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Bench Now'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || benchRecords.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <BenchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSbu={selectedSbu}
        setSelectedSbu={setSelectedSbu}
        selectedExpertise={selectedExpertise}
        setSelectedExpertise={setSelectedExpertise}
        selectedBillType={selectedBillType}
        setSelectedBillType={setSelectedBillType}
        clearFilters={clearFilters}
      />

      {/* Table */}
      <BenchTable
        benchRecords={benchRecords}
        isLoading={isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Pagination */}
      {pagination && (
        <BenchPagination
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

export default BenchReport;
