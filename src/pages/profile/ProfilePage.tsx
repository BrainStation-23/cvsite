import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/use-profile';
import { useForm } from 'react-hook-form';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { GeneralInfoFormData } from '@/components/profile/GeneralInfoTab';
import { Skill } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { User, Edit3, Save, X } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 -m-6 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-cvsite-teal to-cvsite-navy rounded-full shadow-lg">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-cvsite-navy dark:text-white bg-gradient-to-r from-cvsite-navy to-cvsite-teal bg-clip-text text-transparent">
                      My Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Manage your professional information and career details
                    </p>
                  </div>
                </div>
                
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    size="lg"
                    className="bg-gradient-to-r from-cvsite-teal to-cvsite-navy hover:from-cvsite-teal/90 hover:to-cvsite-navy/90 shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Edit3 className="mr-2 h-5 w-5" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button 
                      onClick={form.handleSubmit(handleUpdateProfile)}
                      size="lg"
                      disabled={isSaving || isLoading}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-200"
                    >
                      <Save className="mr-2 h-5 w-5" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      size="lg"
                      disabled={isSaving}
                      className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                      <X className="mr-2 h-5 w-5" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Section */}
          {isLoading ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cvsite-teal"></div>
                  <p className="text-lg text-gray-600 dark:text-gray-400">Loading your profile...</p>
                </div>
              </CardContent>
            </Card>
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
