
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useProfileComposite } from '@/hooks/profile/use-profile-composite';
import { useForm } from 'react-hook-form';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { GeneralInfoFormData } from '@/components/profile/generalInfo/GeneralInfoTab';
import { Skill } from '@/types';

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [newTechnicalSkill, setNewTechnicalSkill] = useState<Omit<Skill, 'id'>>({
    name: '',
    proficiency: 1,
    priority: 0
  });
  const [newSpecializedSkill, setNewSpecializedSkill] = useState<Omit<Skill, 'id'>>({
    name: '',
    proficiency: 1,
    priority: 0
  });

  const {
    isLoading,
    isSaving,
    generalInfo,
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects,
    saveGeneralInfo,
    saveTechnicalSkill,
    saveSpecializedSkill,
    deleteTechnicalSkill,
    deleteSpecializedSkill,
    reorderTechnicalSkills,
    reorderSpecializedSkills,
    saveExperience,
    updateExperience,
    deleteExperience,
    saveEducation,
    updateEducation,
    deleteEducation,
    saveTraining,
    updateTraining,
    deleteTraining,
    saveAchievement,
    updateAchievement,
    deleteAchievement,
    saveProject,
    updateProject,
    deleteProject,
    reorderProjects
  } = useProfileComposite();

  // Updated form to match the GeneralInfoFormData interface
  const form = useForm<GeneralInfoFormData>({
    defaultValues: {
      firstName: generalInfo.firstName,
      lastName: generalInfo.lastName,
      biography: generalInfo.biography || '',
      profileImage: generalInfo.profileImage,
      currentDesignation: generalInfo.currentDesignation || null
    }
  });

  useEffect(() => {
    if (!isLoading) {
      form.reset({
        firstName: generalInfo.firstName,
        lastName: generalInfo.lastName,
        biography: generalInfo.biography || '',
        profileImage: generalInfo.profileImage,
        currentDesignation: generalInfo.currentDesignation || null
      });
    }
  }, [isLoading, generalInfo, form.reset]);

  const handleUpdateProfile = async (data: GeneralInfoFormData) => {
    const success = await saveGeneralInfo(data);
    return success;
  };

  const handleImageUpdate = (imageUrl: string | null) => {
    form.setValue('profileImage', imageUrl);
  };

  const handleAddTechnicalSkill = async () => {
    if (!newTechnicalSkill.name) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive"
      });
      return;
    }
    const success = await saveTechnicalSkill(newTechnicalSkill as Skill);
    if (success) {
      setNewTechnicalSkill({
        name: '',
        proficiency: 1,
        priority: 0
      });
    }
  };

  const handleAddSpecializedSkill = async () => {
    if (!newSpecializedSkill.name) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive"
      });
      return;
    }
    const success = await saveSpecializedSkill(newSpecializedSkill as Skill);
    if (success) {
      setNewSpecializedSkill({
        name: '',
        proficiency: 1,
        priority: 0
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Content area - now takes full height */}
        <div className="flex-1 min-h-0 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading profile information...</p>
            </div>
          ) : (
            <ProfileTabs
              form={form}
              isEditing={true}
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
              handleAddTechnicalSkill={handleAddTechnicalSkill}
              handleAddSpecializedSkill={handleAddSpecializedSkill}
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
              saveGeneralInfo={handleUpdateProfile}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
