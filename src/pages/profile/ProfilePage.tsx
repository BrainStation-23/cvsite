import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';
import { useForm } from 'react-hook-form';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';
import { Skill } from '@/types';

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1 });
  const [newSpecializedSkill, setNewSpecializedSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1 });
  
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
    deleteProject
  } = useProfile();

  // Updated form to match the GeneralInfoFormData interface
  const form = useForm<GeneralInfoFormData>({
    defaultValues: {
      firstName: generalInfo.firstName,
      lastName: generalInfo.lastName,
      biography: generalInfo.biography || '',
      profileImage: generalInfo.profileImage
    }
  });

  // Update form values when profile data changes
  useEffect(() => {
    if (!isLoading) {
      form.reset({
        firstName: generalInfo.firstName,
        lastName: generalInfo.lastName,
        biography: generalInfo.biography || '',
        profileImage: generalInfo.profileImage
      });
    }
  }, [isLoading, generalInfo, form.reset]);

  const handleUpdateProfile = async (data: GeneralInfoFormData) => {
    const success = await saveGeneralInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      biography: data.biography || null,
      profileImage: data.profileImage
    });
    
    if (success) {
      setIsEditing(false);
    }
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
      setNewTechnicalSkill({ name: '', proficiency: 1 });
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
      setNewSpecializedSkill({ name: '', proficiency: 1 });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-cvsite-navy dark:text-white">My Profile</h1>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
          >
            Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
            <Button 
              onClick={form.handleSubmit(handleUpdateProfile)}
              variant="default"
              disabled={isSaving || isLoading}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              onClick={() => setIsEditing(false)}
              variant="outline"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading profile information...</p>
        </div>
      ) : (
        <ProfileTabs
          form={form}
          isEditing={isEditing}
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
          deleteTechnicalSkill={deleteTechnicalSkill}
          deleteSpecializedSkill={deleteSpecializedSkill}
        />
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;
