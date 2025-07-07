
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { useForm } from 'react-hook-form';
import { GeneralInfoFormData } from '@/components/profile/generalInfo/GeneralInfoTab';
import { useAuth } from '@/contexts/AuthContext';
import { useGeneralInfo } from '@/hooks/profile/use-general-info';
import { useSkills } from '@/hooks/profile/use-skills';
import { useExperience } from '@/hooks/profile/use-experience';
import { useEducation } from '@/hooks/profile/use-education';
import { useTraining } from '@/hooks/profile/use-training';
import { useAchievements } from '@/hooks/profile/use-achievements';
import { useProjects } from '@/hooks/profile/use-projects';

const ViewProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newTechnicalSkill, setNewTechnicalSkill] = useState({ name: '', proficiency: 1, priority: 0 });
  const [newSpecializedSkill, setNewSpecializedSkill] = useState({ name: '', proficiency: 1, priority: 0 });
  
  // Use the updated hooks with profileId
  const { isLoading: generalInfoLoading, generalInfo, saveGeneralInfo, isSaving: generalInfoSaving } = useGeneralInfo(profileId);
  const { isLoading: skillsLoading, technicalSkills, specializedSkills, saveTechnicalSkill, saveSpecializedSkill, deleteTechnicalSkill, deleteSpecializedSkill, reorderTechnicalSkills, reorderSpecializedSkills, isSaving: skillsSaving } = useSkills(profileId);
  const { experiences, saveExperience, updateExperience, deleteExperience, isLoading: experienceLoading, isSaving: experienceSaving } = useExperience(profileId);
  const { education, saveEducation, updateEducation, deleteEducation, isLoading: educationLoading, isSaving: educationSaving } = useEducation(profileId);
  const { trainings, saveTraining, updateTraining, deleteTraining, isLoading: trainingLoading, isSaving: trainingSaving } = useTraining(profileId);
  const { achievements, saveAchievement, updateAchievement, deleteAchievement, isLoading: achievementsLoading, isSaving: achievementsSaving } = useAchievements(profileId);
  const { projects, saveProject, updateProject, deleteProject, reorderProjects, isLoading: projectsLoading, isSaving: projectsSaving } = useProjects(profileId);

  // Check if current user can edit (admin or manager)
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const isLoading = generalInfoLoading || skillsLoading || experienceLoading || educationLoading || trainingLoading || achievementsLoading || projectsLoading;
  const isSaving = generalInfoSaving || skillsSaving || experienceSaving || educationSaving || trainingSaving || achievementsSaving || projectsSaving;

  const form = useForm<GeneralInfoFormData>({
    defaultValues: {
      firstName: generalInfo.firstName || '',
      lastName: generalInfo.lastName || '',
      biography: generalInfo.biography || '',
      profileImage: generalInfo.profileImage
    }
  });

  // Update form values when profile data changes
  React.useEffect(() => {
    if (!isLoading) {
      form.reset({
        firstName: generalInfo.firstName || '',
        lastName: generalInfo.lastName || '',
        biography: generalInfo.biography || '',
        profileImage: generalInfo.profileImage
      });
    }
  }, [isLoading, generalInfo, form]);

  const handleImageUpdate = (imageUrl: string | null) => {
    form.setValue('profileImage', imageUrl);
  };

  const handleAddTechnicalSkillWrapper = async () => {
    if (newTechnicalSkill.name.trim()) {
      const success = await saveTechnicalSkill({ ...newTechnicalSkill, id: '' });
      if (success) {
        setNewTechnicalSkill({ name: '', proficiency: 1, priority: 0 });
      }
    }
    return false;
  };

  const handleAddSpecializedSkillWrapper = async () => {
    if (newSpecializedSkill.name.trim()) {
      const success = await saveSpecializedSkill({ ...newSpecializedSkill, id: '' });
      if (success) {
        setNewSpecializedSkill({ name: '', proficiency: 1, priority: 0 });
      }
    }
    return false;
  };

  // Handle general info save for employee profile
  const handleGeneralInfoSave = async (data: GeneralInfoFormData) => {
    const saveData = {
      firstName: data.firstName,
      lastName: data.lastName,
      biography: data.biography || null,
      profileImage: data.profileImage
    };
    
    const success = await saveGeneralInfo(saveData);
    return success;
  };

  // Handle data refresh after import
  const handleDataRefresh = () => {
    console.log('Refreshing all profile data after import...');
    // Force a page reload to ensure all data is refreshed
    window.location.reload();
  };

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
      <div className="flex flex-col h-full">
        {/* Compact header */}
        <div className="flex-shrink-0 flex items-center py-4 px-1 border-b border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/employee-data')}
            className="flex items-center gap-2 mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold text-cvsite-navy dark:text-white">
            {generalInfo.firstName} {generalInfo.lastName}'s Profile
          </h1>
        </div>

        {/* Content area - now takes full height */}
        <div className="flex-1 min-h-0 py-4">
          <ProfileTabs
            form={form}
            isEditing={canEdit}
            onImageUpdate={handleImageUpdate}
            technicalSkills={technicalSkills}
            specializedSkills={specializedSkills}
            experiences={experiences}
            education={education}
            trainings={trainings}
            achievements={achievements}
            projects={projects}
            isSaving={isSaving}
            newTechnicalSkill={newTechnicalSkill}
            newSpecializedSkill={newSpecializedSkill}
            setNewTechnicalSkill={setNewTechnicalSkill}
            setNewSpecializedSkill={setNewSpecializedSkill}
            handleAddTechnicalSkill={handleAddTechnicalSkillWrapper}
            handleAddSpecializedSkill={handleAddSpecializedSkillWrapper}
            saveExperience={saveExperience}
            updateExperience={updateExperience}
            deleteExperience={deleteExperience}
            saveEducation={saveEducation}
            updateEducation={updateEducation}
            deleteEducation={deleteEducation}
            saveTraining={saveTraining}
            updateTraining={updateTraining}
            deleteTraining={deleteTraining}
            saveAchievement={saveAchievement}
            updateAchievement={updateAchievement}
            deleteAchievement={deleteAchievement}
            saveProject={saveProject}
            updateProject={updateProject}
            deleteProject={deleteProject}
            reorderProjects={reorderProjects}
            deleteTechnicalSkill={deleteTechnicalSkill}
            deleteSpecializedSkill={deleteSpecializedSkill}
            saveTechnicalSkill={saveTechnicalSkill}
            saveSpecializedSkill={saveSpecializedSkill}
            reorderTechnicalSkills={reorderTechnicalSkills}
            reorderSpecializedSkills={reorderSpecializedSkills}
            profileId={profileId}
            saveGeneralInfo={handleGeneralInfoSave}
            onDataChange={handleDataRefresh}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewProfilePage;
