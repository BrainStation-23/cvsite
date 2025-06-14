
import React, { useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useEmployeeProfiles } from '@/hooks/use-employee-profiles';
import { useEmployeeList } from '@/hooks/use-employee-list';
import { useBulkSelection } from '@/hooks/use-bulk-selection';
import EnhancedEmployeeSearchFilters from '@/components/employee/EnhancedEmployeeSearchFilters';
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
    // Find the profiles for the selected IDs
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

    // Here you would implement the actual bulk email functionality
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

    // Here you would implement the actual export functionality
    console.log('Exporting profiles:', selectedProfilesData, 'Format:', format);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <EmployeePageHeader />

        <EnhancedEmployeeSearchFilters
          onSearch={handleSearch}
          onSkillFilter={handleSkillFilter}
          onExperienceFilter={handleExperienceFilter}
          onEducationFilter={handleEducationFilter}
          onTrainingFilter={handleTrainingFilter}
          onAchievementFilter={handleAchievementFilter}
          onProjectFilter={handleProjectFilter}
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
