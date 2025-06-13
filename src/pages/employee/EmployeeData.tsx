
import React, { useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { useEmployeeProfiles } from '@/hooks/use-employee-profiles';
import { useEmployeeList } from '@/hooks/use-employee-list';
import EmployeeSearchFilters from '@/components/employee/EmployeeSearchFilters';
import EmployeeTable from '@/components/employee/EmployeeTable';
import EmployeePageHeader from '@/components/employee/EmployeePageHeader';
import UserPagination from '@/components/admin/UserPagination';
import SendEmailModal from '@/components/admin/SendEmailModal';

const EmployeeData: React.FC = () => {
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

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handlePerPageChange = (perPage: number) => {
    fetchProfiles({ perPage, page: 1 });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <EmployeePageHeader />

        <EmployeeSearchFilters
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

        <Card>
          <CardContent className="p-0">
            <EmployeeTable
              profiles={profiles}
              isLoading={isLoading}
              onViewProfile={handleViewProfile}
              onSendEmail={handleSendEmail}
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
