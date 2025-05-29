
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';
import { useForm } from 'react-hook-form';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';
import { Skill } from '@/types';
import { Edit3, Save, X } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1, priority: 0 });
  const [newSpecializedSkill, setNewSpecializedSkill] = useState<Omit<Skill, 'id'>>({ name: '', proficiency: 1, priority: 0 });
  
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
      setNewTechnicalSkill({ name: '', proficiency: 1, priority: 0 });
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
      setNewSpecializedSkill({ name: '', proficiency: 1, priority: 0 });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Compact header */}
        <div className="flex-shrink-0 flex justify-between items-center py-4 px-1 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold text-cvsite-navy dark:text-white">Profile</h1>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                onClick={form.handleSubmit(handleUpdateProfile)}
                variant="default"
                size="sm"
                className="h-8"
                disabled={isSaving || isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button 
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
                className="h-8"
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 py-4">
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
              reorderProjects={reorderProjects}
              deleteTechnicalSkill={deleteTechnicalSkill}
              deleteSpecializedSkill={deleteSpecializedSkill}
              saveTechnicalSkill={saveTechnicalSkill}
              saveSpecializedSkill={saveSpecializedSkill}
              reorderTechnicalSkills={reorderTechnicalSkills}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
