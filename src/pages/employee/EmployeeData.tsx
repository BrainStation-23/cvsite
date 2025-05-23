
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Eye, User } from 'lucide-react';
import { useEmployeeProfiles } from '@/hooks/use-employee-profiles';
import EmployeeSearchFilters from '@/components/employee/EmployeeSearchFilters';
import UserPagination from '@/components/admin/UserPagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const EmployeeData: React.FC = () => {
  const navigate = useNavigate();
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

  const handleViewProfile = (profileId: string) => {
    navigate(`/employee/profile/${profileId}`);
  };

  const handlePerPageChange = (perPage: number) => {
    fetchProfiles({ perPage, page: 1 });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const getSkillsSummary = (technicalSkills: any[], specializedSkills: any[]) => {
    const allSkills = [...(technicalSkills || []), ...(specializedSkills || [])];
    if (allSkills.length === 0) return 'No skills listed';
    if (allSkills.length <= 3) {
      return allSkills.map(skill => skill.name).join(', ');
    }
    return `${allSkills.slice(0, 3).map(skill => skill.name).join(', ')} +${allSkills.length - 3} more`;
  };

  const getCurrentExperience = (experiences: any[]) => {
    if (!experiences || experiences.length === 0) return 'No experience listed';
    const current = experiences.find(exp => exp.is_current);
    if (current) return `${current.designation} at ${current.company_name}`;
    const latest = experiences[0];
    return `${latest.designation} at ${latest.company_name}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">Employee Data</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive employee profiles with skills, experience, and more
            </p>
          </div>
        </div>

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
            {isLoading && profiles.length === 0 ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-cvsite-teal" />
              </div>
            ) : (
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Current Experience</TableHead>
                      <TableHead>Skills Summary</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.length > 0 ? (
                      profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={profile.profile_image} alt={`${profile.first_name} ${profile.last_name}`} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {profile.first_name || 'N/A'} {profile.last_name || ''}
                                </div>
                                {profile.biography && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="text-sm text-gray-500 truncate max-w-[200px] cursor-help">
                                        {profile.biography}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-[300px]">{profile.biography}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {profile.employee_id || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {getCurrentExperience(profile.experiences || [])}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-sm text-gray-600 dark:text-gray-400 cursor-help">
                                  {getSkillsSummary(profile.technical_skills || [], profile.specialized_skills || [])}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-2 max-w-[300px]">
                                  {profile.technical_skills && profile.technical_skills.length > 0 && (
                                    <div>
                                      <div className="font-medium">Technical Skills:</div>
                                      <div className="text-sm">
                                        {profile.technical_skills.map(skill => skill.name).join(', ')}
                                      </div>
                                    </div>
                                  )}
                                  {profile.specialized_skills && profile.specialized_skills.length > 0 && (
                                    <div>
                                      <div className="font-medium">Specialized Skills:</div>
                                      <div className="text-sm">
                                        {profile.specialized_skills.map(skill => skill.name).join(', ')}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {profile.education && profile.education.length > 0 ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="cursor-help">
                                      {profile.education[0].degree || 'Degree'} from {profile.education[0].university}
                                      {profile.education.length > 1 && (
                                        <span className="text-gray-500"> +{profile.education.length - 1} more</span>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-1 max-w-[300px]">
                                      {profile.education.map((edu, index) => (
                                        <div key={index} className="text-sm">
                                          {edu.degree || 'Degree'} from {edu.university}
                                          {edu.department && ` (${edu.department})`}
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                'No education listed'
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewProfile(profile.id)}
                              className="h-8 px-3"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-cvsite-teal mr-2" />
                              Loading employee profiles...
                            </div>
                          ) : (
                            'No employee profiles found'
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TooltipProvider>
            )}
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
    </DashboardLayout>
  );
};

export default EmployeeData;
