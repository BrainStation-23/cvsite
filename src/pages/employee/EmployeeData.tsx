
import React, { useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useEmployeeProfiles } from '@/hooks/use-employee-profiles';
import { useEmployeeList } from '@/hooks/use-employee-list';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import CompactSearchFilters from '@/components/employee/search/CompactSearchFilters';
import EnhancedEmployeeTable from '@/components/employee/EnhancedEmployeeTable';
import BulkActionsToolbar from '@/components/employee/BulkActionsToolbar';
import EmployeePageHeader from '@/components/employee/EmployeePageHeader';
import UserPagination from '@/components/admin/UserPagination';
import SendEmailModal from '@/components/admin/SendEmailModal';
import { useToast } from '@/hooks/use-toast';

const EmployeeData: React.FC = () => {
  const { toast } = useToast();
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
    resetFilters
  } = useEmployeeProfiles();

  const {
    selectedItems: selectedProfiles,
    selectItem: selectProfile,
    selectAll,
    clearSelection,
    isAllSelected,
    hasSelection
  } = useBulkSelection(profiles);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handlePerPageChange = (perPage: number) => {
    fetchProfiles({ perPage, page: 1 });
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <EmployeePageHeader />

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column - Table View (8/12 columns) */}
          <div className="xl:col-span-8 space-y-6">
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

            <Card>
              <CardContent className="p-0">
                <EnhancedEmployeeTable
                  profiles={profiles}
                  isLoading={isLoading}
                  onViewProfile={handleViewProfile}
                  onSendEmail={handleSendEmail}
                  selectedProfiles={selectedProfiles}
                  onProfileSelect={selectProfile}
                  onSelectAll={selectAll}
                  onClearSelection={clearSelection}
                  isAllSelected={isAllSelected}
                />
              </CardContent>
            </Card>

            {pagination.pageCount > 1 && (
              <UserPagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right Column - Search Filters (4/12 columns) */}
          <div className="xl:col-span-4">
            <div className="sticky top-6">
              <CompactSearchFilters
                onSearch={handleSearch}
                onSkillFilter={handleSkillFilter}
                onExperienceFilter={handleExperienceFilter}
                onEducationFilter={handleEducationFilter}
                onTrainingFilter={handleTrainingFilter}
                onAchievementFilter={handleAchievementFilter}
                onProjectFilter={handleProjectFilter}
                onAdvancedFilters={handleAdvancedFilters}
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
          </div>
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
