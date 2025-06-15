import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoTab, GeneralInfoFormData } from './GeneralInfoTab';
import { SkillsTab } from './SkillsTab';
import { ExperienceTab } from './ExperienceTab';
import { EducationTab } from './EducationTab';
import { TrainingTab } from './training/TrainingTab';
import { AchievementsTab } from './AchievementsTab';
import { ProjectsTab } from './ProjectsTab';
import { JSONImportExport } from './JSONImportExport';
import { useProfileImport } from '@/hooks/profile/use-profile-import';
import { GameNotificationBadge } from '@/components/ui/game-notification-badge';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';
import { 
  User, 
  Code, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Trophy, 
  FolderOpen, 
  FileJson
} from 'lucide-react';

interface ProfileTabsProps {
  form: UseFormReturn<GeneralInfoFormData>;
  isEditing: boolean;
  onImageUpdate: (imageUrl: string | null) => void;
  technicalSkills: Skill[];
  specializedSkills: Skill[];
  experiences: Experience[];
  education: Education[];
  trainings: Training[];
  achievements: Achievement[];
  projects: Project[];
  isSaving: boolean;
  newTechnicalSkill: Omit<Skill, 'id'>;
  newSpecializedSkill: Omit<Skill, 'id'>;
  setNewTechnicalSkill: (skill: Omit<Skill, 'id'>) => void;
  setNewSpecializedSkill: (skill: Omit<Skill, 'id'>) => void;
  handleAddTechnicalSkill: () => void;
  handleAddSpecializedSkill: () => void;
  saveExperience: (experience: Omit<Experience, 'id'>) => Promise<boolean>;
  updateExperience: (id: string, experience: Partial<Experience>) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  saveEducation: (education: Omit<Education, 'id'>) => Promise<boolean>;
  updateEducation: (id: string, education: Partial<Education>) => Promise<boolean>;
  deleteEducation: (id: string) => Promise<boolean>;
  saveTraining: (training: Omit<Training, 'id'>) => Promise<boolean>;
  updateTraining: (id: string, training: Partial<Training>) => Promise<boolean>;
  deleteTraining: (id: string) => Promise<boolean>;
  saveAchievement: (achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => Promise<boolean>;
  deleteAchievement: (id: string) => Promise<boolean>;
  saveProject: (project: Omit<Project, 'id'>) => Promise<boolean>;
  updateProject: (id: string, project: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  reorderProjects: (projects: Project[]) => Promise<boolean>;
  deleteTechnicalSkill: (id: string) => Promise<boolean>;
  deleteSpecializedSkill: (id: string) => Promise<boolean>;
  saveTechnicalSkill: (skill: Skill) => Promise<boolean>;
  saveSpecializedSkill: (skill: Skill) => Promise<boolean>;
  reorderTechnicalSkills: (skills: Skill[]) => Promise<boolean>;
  reorderSpecializedSkills: (skills: Skill[]) => Promise<boolean>;
  profileId?: string;
  saveGeneralInfo: (data: GeneralInfoFormData) => Promise<boolean>;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  form,
  isEditing,
  onImageUpdate,
  technicalSkills,
  specializedSkills,
  experiences,
  education,
  trainings,
  achievements,
  projects,
  isSaving,
  newTechnicalSkill,
  newSpecializedSkill,
  setNewTechnicalSkill,
  setNewSpecializedSkill,
  handleAddTechnicalSkill,
  handleAddSpecializedSkill,
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
  reorderProjects,
  deleteTechnicalSkill,
  deleteSpecializedSkill,
  saveTechnicalSkill,
  saveSpecializedSkill,
  reorderTechnicalSkills,
  reorderSpecializedSkills,
  profileId,
  saveGeneralInfo
}) => {
  // Handle general info save with proper conversion and return boolean
  const handleGeneralInfoSave = async (data: GeneralInfoFormData): Promise<boolean> => {
    const saveData = {
      firstName: data.firstName,
      lastName: data.lastName,
      biography: data.biography || null,
      profileImage: data.profileImage,
      currentDesignation: data.currentDesignation || null
    };
    
    try {
      const success = await saveGeneralInfo(saveData);
      return success;
    } catch (error) {
      console.error('Failed to save general information:', error);
      return false;
    }
  };

  // Set up import handlers for JSON import
  const { importProfile } = useProfileImport({
    saveGeneralInfo: handleGeneralInfoSave,
    saveTechnicalSkill,
    saveSpecializedSkill,
    saveExperience,
    saveEducation,
    saveTraining,
    saveAchievement,
    saveProject
  });

  // Prepare profile data for export
  const profileData = {
    generalInfo: {
      firstName: form.getValues('firstName'),
      lastName: form.getValues('lastName'),
      biography: form.getValues('biography'),
      profileImage: form.getValues('profileImage')
    },
    technicalSkills,
    specializedSkills,
    experiences,
    education,
    trainings,
    achievements,
    projects
  };

  // Helper function to check if general info is incomplete
  const isGeneralInfoIncomplete = () => {
    const firstName = form.getValues('firstName');
    const lastName = form.getValues('lastName');
    const biography = form.getValues('biography');
    const profileImage = form.getValues('profileImage');
    
    return !firstName || !lastName || !biography || !profileImage;
  };

  // Helper function to create tab trigger with icon and game-style notification
  const TabTriggerWithIcon = ({ 
    value, 
    icon: Icon, 
    label, 
    isEmpty, 
    dataTour 
  }: { 
    value: string; 
    icon: React.ElementType; 
    label: string; 
    isEmpty: boolean;
    dataTour: string;
  }) => (
    <TabsTrigger 
      value={value} 
      data-tour={dataTour} 
      className="text-xs py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 relative"
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
        {isEmpty && <GameNotificationBadge />}
      </div>
    </TabsTrigger>
  );

  return (
    <Tabs defaultValue="general" className="w-full h-full flex flex-col">
      {/* Updated tabs header with icons and game-style notifications */}
      <div className="flex-shrink-0">
        <TabsList className="grid w-full grid-cols-8 h-12 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
          <TabTriggerWithIcon
            value="general"
            icon={User}
            label="General"
            isEmpty={isGeneralInfoIncomplete()}
            dataTour="general-tab"
          />
          <TabTriggerWithIcon
            value="skills"
            icon={Code}
            label="Skills"
            isEmpty={technicalSkills.length === 0 && specializedSkills.length === 0}
            dataTour="skills-tab"
          />
          <TabTriggerWithIcon
            value="experience"
            icon={Briefcase}
            label="Experience"
            isEmpty={experiences.length === 0}
            dataTour="experience-tab"
          />
          <TabTriggerWithIcon
            value="education"
            icon={GraduationCap}
            label="Education"
            isEmpty={education.length === 0}
            dataTour="education-tab"
          />
          <TabTriggerWithIcon
            value="training"
            icon={Award}
            label="Training"
            isEmpty={trainings.length === 0}
            dataTour="training-tab"
          />
          <TabTriggerWithIcon
            value="achievements"
            icon={Trophy}
            label="Achievements"
            isEmpty={achievements.length === 0}
            dataTour="achievements-tab"
          />
          <TabTriggerWithIcon
            value="projects"
            icon={FolderOpen}
            label="Projects"
            isEmpty={projects.length === 0}
            dataTour="projects-tab"
          />
          <TabTriggerWithIcon
            value="json"
            icon={FileJson}
            label="JSON"
            isEmpty={false}
            dataTour="json-tab"
          />
        </TabsList>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 mt-4">
        <TabsContent value="general" className="mt-0 h-full overflow-auto">
          <GeneralInfoTab 
            form={form} 
            isEditing={isEditing} 
            onImageUpdate={onImageUpdate}
            profileId={profileId}
            onSave={handleGeneralInfoSave}
            isSaving={isSaving}
          />
        </TabsContent>
        
        <TabsContent value="skills" className="mt-0 h-full overflow-auto">
          <SkillsTab
            technicalSkills={technicalSkills}
            specializedSkills={specializedSkills}
            isEditing={isEditing}
            newTechnicalSkill={newTechnicalSkill}
            newSpecializedSkill={newSpecializedSkill}
            setNewTechnicalSkill={setNewTechnicalSkill}
            setNewSpecializedSkill={setNewSpecializedSkill}
            handleAddTechnicalSkill={handleAddTechnicalSkill}
            handleAddSpecializedSkill={handleAddSpecializedSkill}
            deleteTechnicalSkill={deleteTechnicalSkill}
            deleteSpecializedSkill={deleteSpecializedSkill}
            saveTechnicalSkill={saveTechnicalSkill}
            saveSpecializedSkill={saveSpecializedSkill}
            onReorderTechnicalSkills={reorderTechnicalSkills}
            onReorderSpecializedSkills={reorderSpecializedSkills}
          />
        </TabsContent>
        
        <TabsContent value="experience" className="mt-0 h-full overflow-auto">
          <ExperienceTab
            experiences={experiences}
            isEditing={isEditing}
            isSaving={isSaving}
            profileId={profileId}
            onSave={saveExperience}
            onUpdate={updateExperience}
            onDelete={deleteExperience}
          />
        </TabsContent>
        
        <TabsContent value="education" className="mt-0 h-full overflow-auto">
          <EducationTab
            education={education}
            isEditing={isEditing}
            isSaving={isSaving}
            onSave={saveEducation}
            onUpdate={updateEducation}
            onDelete={deleteEducation}
          />
        </TabsContent>
        
        <TabsContent value="training" className="mt-0 h-full overflow-auto">
          <TrainingTab
            trainings={trainings}
            isEditing={isEditing}
            isSaving={isSaving}
            onSave={saveTraining}
            onUpdate={updateTraining}
            onDelete={deleteTraining}
          />
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-0 h-full overflow-auto">
          <AchievementsTab
            achievements={achievements}
            isEditing={isEditing}
            isSaving={isSaving}
            onSave={saveAchievement}
            onUpdate={updateAchievement}
            onDelete={deleteAchievement}
          />
        </TabsContent>
        
        <TabsContent value="projects" className="mt-0 h-full overflow-auto">
          <ProjectsTab
            projects={projects}
            isEditing={isEditing}
            isSaving={isSaving}
            onSave={saveProject}
            onUpdate={updateProject}
            onDelete={deleteProject}
            onReorder={reorderProjects}
          />
        </TabsContent>
        
        <TabsContent value="json" className="mt-0 h-full overflow-auto">
          <JSONImportExport
            profileData={profileData}
            onImport={importProfile}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
