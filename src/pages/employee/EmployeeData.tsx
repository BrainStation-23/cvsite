
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUnifiedSearch } from '@/hooks/use-unified-search';
import { useEmployeeList } from '@/hooks/use-employee-list';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import UnifiedSearchBar from '@/components/employee/search/UnifiedSearchBar';
import SimpleEmployeeTable from '@/components/employee/search/SimpleEmployeeTable';
import BulkActionsToolbar from '@/components/employee/BulkActionsToolbar';
import UserPagination from '@/components/admin/UserPagination';
import SendEmailModal from '@/components/admin/SendEmailModal';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, RefreshCw, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const EmployeeData: React.FC = () => {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<string | null>(null);
  const [showSearchRank, setShowSearchRank] = useState(false);
  
  const {
    selectedProfile,
    isEmailModalOpen,
    handleViewProfile,
    handleSendEmail,
    handleCloseEmailModal
  } = useEmployeeList();
  
  const {
    profiles,
    isLoading,
    pagination,
    searchQuery,
    minExperience,
    maxExperience,
    availabilityFilter,
    sbuFilter,
    search,
    handleSearch,
    handlePageChange,
    handleFilterChange,
    handleSortChange,
    resetFilters
  } = useUnifiedSearch();

  const {
    selectedItems: selectedProfiles,
    selectItem,
    selectAll,
    clearSelection,
    isAllSelected,
    hasSelection
  } = useBulkSelection(profiles);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLastError(null);
        await search();
      } catch (error) {
        console.error('Error loading employee data:', error);
        const errorMessage = error?.message || 'Unknown error occurred';
        setLastError(`Failed to load employee data: ${errorMessage}`);
        
        toast({
          title: "Error loading data",
          description: "There was an error loading employee profiles. Please try again.",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, []);

  const handleRetry = async () => {
    try {
      setLastError(null);
      await search();
      toast({
        title: "Success",
        description: "Employee data loaded successfully!",
      });
    } catch (error) {
      console.error('Retry failed:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      setLastError(errorMessage);
    }
  };

  const handlePerPageChange = (perPage: number) => {
    search({ perPage, page: 1 });
  };

  const handleProfileSelect = (profileId: string) => {
    const isCurrentlySelected = selectedProfiles.includes(profileId);
    selectItem(profileId, !isCurrentlySelected);
  };

  const handleBulkEmail = (profileIds: string[]) => {
    const selectedProfilesData = profiles.filter(profile => profileIds.includes(profile.id));
    
    if (selectedProfilesData.length === 0) {
      toast({
        title: "No profiles selected",
        description: "Please select at least one profile to send emails.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bulk email initiated",
      description: `Sending emails to ${selectedProfilesData.length} employees...`,
    });

    console.log('Sending bulk emails to:', selectedProfilesData);
  };

  const handleBulkExport = (profileIds: string[], format: 'csv' | 'excel' | 'pdf') => {
    const selectedProfilesData = profiles.filter(profile => profileIds.includes(profile.id));
    
    if (selectedProfilesData.length === 0) {
      toast({
        title: "No profiles selected",
        description: "Please select at least one profile to export.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Export initiated",
      description: `Exporting ${selectedProfilesData.length} profiles as ${format.toUpperCase()}...`,
    });

    console.log('Exporting profiles:', selectedProfilesData, 'Format:', format);
  };

  // Map SearchPagination to PaginationData format expected by UserPagination
  const mappedPagination = {
    totalCount: pagination.total_count,
    filteredCount: pagination.filtered_count,
    page: pagination.page,
    perPage: pagination.per_page,
    pageCount: pagination.page_count
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="h-8 w-8 mr-3 text-blue-600" />
              Employee Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Search and manage employee profiles with intelligent full-text search
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Results Summary */}
            {pagination.filtered_count > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <Badge variant="outline" className="mr-2">
                  {pagination.filtered_count} of {pagination.total_count} employees
                </Badge>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearchRank(!showSearchRank)}
                    className="text-xs"
                  >
                    <Search className="h-3 w-3 mr-1" />
                    {showSearchRank ? 'Hide' : 'Show'} Relevance
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {lastError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{lastError}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Unified Search Bar */}
        <UnifiedSearchBar
          searchQuery={searchQuery}
          minExperience={minExperience}
          maxExperience={maxExperience}
          availabilityFilter={availabilityFilter}
          sbuFilter={sbuFilter}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          isLoading={isLoading}
        />

        {/* Bulk Actions */}
        {hasSelection && (
          <BulkActionsToolbar
            selectedProfiles={selectedProfiles}
            totalProfiles={profiles.length}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            onBulkEmail={handleBulkEmail}
            onBulkExport={handleBulkExport}
            isAllSelected={isAllSelected}
          />
        )}

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              {pagination.filtered_count > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Page {pagination.page} of {pagination.page_count}</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SimpleEmployeeTable
              profiles={profiles}
              isLoading={isLoading}
              onViewProfile={handleViewProfile}
              onSendEmail={handleSendEmail}
              selectedProfiles={selectedProfiles}
              onProfileSelect={handleProfileSelect}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
              isAllSelected={isAllSelected}
              showSearchRank={showSearchRank && searchQuery.length > 0}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.page_count > 1 && (
          <UserPagination
            pagination={mappedPagination}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            isLoading={isLoading}
          />
        )}

        {/* Email Modal */}
        {selectedProfile && (
          <SendEmailModal
            isOpen={isEmailModalOpen}
            onClose={handleCloseEmailModal}
            profile={selectedProfile}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeData;
