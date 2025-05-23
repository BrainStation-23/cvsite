
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEmployeeProfile } from '@/hooks/use-employee-profile';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { useForm } from 'react-hook-form';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';

const ViewProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  
  const {
    isLoading,
    generalInfo,
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects
  } = useEmployeeProfile(profileId || '');

  const form = useForm<GeneralInfoFormData>({
    defaultValues: {
      firstName: generalInfo.firstName || '',
      lastName: generalInfo.lastName || '',
      biography: generalInfo.biography || ''
    }
  });

  // Update form values when profile data changes
  React.useEffect(() => {
    if (!isLoading) {
      form.reset({
        firstName: generalInfo.firstName || '',
        lastName: generalInfo.lastName || '',
        biography: generalInfo.biography || ''
      });
    }
  }, [isLoading, generalInfo, form]);

  // Dummy functions since this is read-only
  const dummyFunction = async () => false;
  const dummySkillSetter = () => {};

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading profile information...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/employee-data')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employee Data
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">
              {generalInfo.firstName} {generalInfo.lastName}'s Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Employee profile details
            </p>
          </div>
        </div>

        <ProfileTabs
          form={form}
          isEditing={false}
          technicalSkills={technicalSkills}
          specializedSkills={specializedSkills}
          experiences={experiences}
          education={education}
          trainings={trainings}
          achievements={achievements}
          projects={projects}
          isSaving={false}
          newTechnicalSkill={{ name: '', proficiency: 1 }}
          newSpecializedSkill={{ name: '', proficiency: 1 }}
          setNewTechnicalSkill={dummySkillSetter}
          setNewSpecializedSkill={dummySkillSetter}
          handleAddTechnicalSkill={dummyFunction}
          handleAddSpecializedSkill={dummyFunction}
          saveExperience={dummyFunction}
          updateExperience={dummyFunction}
          deleteExperience={dummyFunction}
          saveEducation={dummyFunction}
          updateEducation={dummyFunction}
          deleteEducation={dummyFunction}
          saveTraining={dummyFunction}
          updateTraining={dummyFunction}
          deleteTraining={dummyFunction}
          saveAchievement={dummyFunction}
          updateAchievement={dummyFunction}
          deleteAchievement={dummyFunction}
          saveProject={dummyFunction}
          updateProject={dummyFunction}
          deleteProject={dummyFunction}
          deleteTechnicalSkill={dummyFunction}
          deleteSpecializedSkill={dummyFunction}
        />
      </div>
    </DashboardLayout>
  );
};

export default ViewProfilePage;
