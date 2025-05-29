import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoTab, GeneralInfoFormData } from './GeneralInfoTab';
import { SkillsTab } from './SkillsTab';
import { ExperienceTab } from './ExperienceTab';
import { EducationTab } from './EducationTab';
import { TrainingTab } from './training/TrainingTab';
import { AchievementsTab } from './AchievementsTab';
import { ProjectsTab } from './ProjectsTab';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';

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
  deleteTechnicalSkill: (id: string) => Promise<boolean>;
  deleteSpecializedSkill: (id: string) => Promise<boolean>;
  saveTechnicalSkill: (skill: Skill) => Promise<boolean>;
  saveSpecializedSkill: (skill: Skill) => Promise<boolean>;
  reorderTechnicalSkills: (skills: Skill[]) => Promise<boolean>;
  profileId?: string;
  reorderProjects: (reorderedProjects: Project[]) => Promise<boolean>;
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
  deleteTechnicalSkill,
  deleteSpecializedSkill,
  saveTechnicalSkill,
  saveSpecializedSkill,
  reorderTechnicalSkills,
  profileId,
  reorderProjects
}) => {
  return (
    <Tabs defaultValue="general" className="w-full h-full flex flex-col">
      {/* Compact tabs header */}
      <div className="flex-shrink-0">
        <TabsList className="grid w-full grid-cols-7 h-10 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
          <TabsTrigger value="general" className="text-xs py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            General
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Skills
          </TabsTrigger>
          <TabsTrigger value="experience" className="text-xs py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="text-xs py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Education
          </TabsTrigger>
          <TabsTrigger value="training" className="text-xs py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Training
          </TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Achievements
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-xs py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
            Projects
          </TabsTrigger>
        </TabsList>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 mt-4">
        <TabsContent value="general" className="mt-0 h-full overflow-auto">
          <GeneralInfoTab 
            form={form} 
            isEditing={isEditing} 
            onImageUpdate={onImageUpdate} 
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
            onReorderProjects={reorderProjects}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
