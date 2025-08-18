import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmployeeProfilesEnhanced } from '@/hooks/use-employee-profiles-enhanced';
import { useEmployeeList } from '@/hooks/use-employee-list';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import VerticalEmployeeSearchSidebar from '@/components/employee/search/vertical/VerticalEmployeeSearchSidebar';
import CompactEmployeeTable from '@/components/employee/CompactEmployeeTable';
import BulkActionsToolbar from '@/components/employee/BulkActionsToolbar';
import EmployeePageHeader from '@/components/employee/EmployeePageHeader';
import UserPagination from '@/components/admin/UserPagination';
import SendEmailModal from '@/components/admin/SendEmailModal';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmployeeData: React.FC = () => {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
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
    skillFilter,
    experienceFilter,
    educationFilter,
    trainingFilter,
    achievementFilter,
    projectFilter,
    sortBy,
    sortOrder,
    // New resource planning states
    minEngagementPercentage,
    maxEngagementPercentage,
    minBillingPercentage,
    maxBillingPercentage,
    releaseDateFrom,
    releaseDateTo,
    availabilityStatus,
    currentProjectSearch,
    fetchProfiles,
    handlePageChange,
    handleSearch,
    handleSkillFilter,
    handleExperienceFilter,
    handleEducationFilter,
    handleTrainingFilter,
    handleAchievementFilter,
    handleProjectFilter,
    handleSortChange,
    handleAdvancedFilters,
    handleResourcePlanningFilters,
    resetFilters
  } = useEmployeeProfilesEnhanced();

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
        await fetchProfiles();
      } catch (error) {
        console.error('Error loading employee data:', error);
        const errorMessage = error?.message || 'Unknown error occurred';
        
        if (errorMessage.includes('statement timeout') || errorMessage.includes('57014')) {
          setLastError('The request timed out due to large dataset. Please try using filters to narrow down the results.');
        } else {
          setLastError(`Failed to load employee data: ${errorMessage}`);
        }
        
        toast({
          title: "Error loading data",
          description: errorMessage.includes('statement timeout') 
            ? "Database query timed out. Try applying filters to reduce the dataset size."
            : "There was an error loading employee profiles. Please try again.",
          variant: "destructive"
        });
      }
    };

    loadData();
  }, []);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    try {
      setLastError(null);
      await fetchProfiles();
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
    fetchProfiles({ perPage, page: 1 });
  };

  const handleProfileSelect = (profileId: string) => {
    const isCurrentlySelected = selectedProfiles.includes(profileId);
    selectItem(profileId, !isCurrentlySelected);
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

  return (
    <DashboardLayout>
      <div className="h-full w-full flex overflow-hidden">
        {/* Main Content Area - Left Side */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
          <div className="flex-shrink-0 mb-3">
            <EmployeePageHeader />
          </div>

          {lastError && (
            <div className="flex-shrink-0 mb-3">
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
            </div>
          )}

          {hasSelection && (
            <div className="flex-shrink-0 mb-3">
              <BulkActionsToolbar
                selectedProfiles={selectedProfiles}
                totalProfiles={profiles.length}
                onSelectAll={selectAll}
                onClearSelection={clearSelection}
                onBulkEmail={() => {}}
                onBulkExport={handleBulkExport}
                isAllSelected={isAllSelected}
              />
            </div>
          )}

          <div className="flex-1 min-h-0 flex flex-col">
            <Card className="flex-1 min-h-0">
              <CardContent className="p-0 h-full">
                <CompactEmployeeTable
                  profiles={profiles}
                  isLoading={isLoading}
                  onViewProfile={handleViewProfile}
                  onSendEmail={handleSendEmail}
                  selectedProfiles={selectedProfiles}
                  onProfileSelect={handleProfileSelect}
                  onSelectAll={selectAll}
                  onClearSelection={clearSelection}
                  isAllSelected={isAllSelected}
                />
              </CardContent>
            </Card>
          </div>

          {pagination.pageCount > 1 && (
            <div className="flex-shrink-0 mt-3">
              <UserPagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Vertical Search Sidebar - Right Side */}
        <div className="flex-shrink-0 border-l border-gray-200 dark:border-gray-700 h-full">
          <VerticalEmployeeSearchSidebar
            onSearch={handleSearch}
            onSkillFilter={handleSkillFilter}
            onExperienceFilter={handleExperienceFilter}
            onEducationFilter={handleEducationFilter}
            onTrainingFilter={handleTrainingFilter}
            onAchievementFilter={handleAchievementFilter}
            onProjectFilter={handleProjectFilter}
            onAdvancedFilters={handleAdvancedFilters}
            onResourcePlanningFilters={handleResourcePlanningFilters}
            onSortChange={handleSortChange}
            onReset={resetFilters}
            searchQuery={searchQuery}
            skillFilter={skillFilter}
            experienceFilter={experienceFilter}
            educationFilter={educationFilter}
            trainingFilter={trainingFilter}
            achievementFilter={achievementFilter}
            projectFilter={projectFilter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            isLoading={isLoading}
          />
        </div>

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
