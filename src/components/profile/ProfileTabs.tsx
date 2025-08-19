
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralInfoTab } from './generalInfo/GeneralInfoTab';
import { SkillsTab } from './skills/SkillsTab';
import { ExperienceTab } from './experience/ExperienceTab';
import { EducationTab } from './education/EducationTab';
import { TrainingTab } from './training/TrainingTab';
import { AchievementTab } from './achievement/AchievementTab';
import { ProjectTab } from './project/ProjectTab';
import { CVImportTab } from './cv-import/CVImportTab';
import { JSONImportExportTab } from './import-export/JSONImportExportTab';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoFormData } from './generalInfo/GeneralInfoTab';
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
  handleAddTechnicalSkill: () => Promise<void>;
  handleAddSpecializedSkill: () => Promise<void>;
  saveExperience: (experience: Omit<Experience, 'id'>) => Promise<boolean>;
  updateExperience: (id: string, experience: Omit<Experience, 'id'>) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  saveEducation: (education: Omit<Education, 'id'>) => Promise<boolean>;
  updateEducation: (id: string, education: Omit<Education, 'id'>) => Promise<boolean>;
  deleteEducation: (id: string) => Promise<boolean>;
  saveTraining: (training: Omit<Training, 'id'>) => Promise<boolean>;
  updateTraining: (id: string, training: Omit<Training, 'id'>) => Promise<boolean>;
  deleteTraining: (id: string) => Promise<boolean>;
  saveAchievement: (achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  updateAchievement: (id: string, achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  deleteAchievement: (id: string) => Promise<boolean>;
  saveProject: (project: Omit<Project, 'id'>) => Promise<boolean>;
  updateProject: (id: string, project: Omit<Project, 'id'>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  reorderProjects: (projects: Project[]) => Promise<boolean>;
  deleteTechnicalSkill: (id: string) => Promise<boolean>;
  deleteSpecializedSkill: (id: string) => Promise<boolean>;
  saveTechnicalSkill: (skill: Skill) => Promise<boolean>;
  saveSpecializedSkill: (skill: Skill) => Promise<boolean>;
  reorderTechnicalSkills: (skills: Skill[]) => Promise<boolean>;
  reorderSpecializedSkills: (skills: Skill[]) => Promise<boolean>;
  saveGeneralInfo: (data: GeneralInfoFormData) => Promise<boolean>;
  cvImportHandlers?: any; // Optional handlers for CV import
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
  saveGeneralInfo,
  cvImportHandlers
}) => {
  return (
    <Tabs defaultValue="general" className="w-full h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-9 mb-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="experience">Experience</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="training">Training</TabsTrigger>
        <TabsTrigger value="achievements">Achievements</TabsTrigger>
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="cv-import">CV Import</TabsTrigger>
        <TabsTrigger value="import-export">Import/Export</TabsTrigger>
      </TabsList>

      <div className="flex-1 min-h-0">
        <TabsContent value="general" className="h-full">
          <GeneralInfoTab
            form={form}
            isEditing={isEditing}
            onImageUpdate={onImageUpdate}
            isSaving={isSaving}
            saveGeneralInfo={saveGeneralInfo}
          />
        </TabsContent>

        <TabsContent value="skills" className="h-full">
          <SkillsTab
            technicalSkills={technicalSkills}
            specializedSkills={specializedSkills}
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
            reorderTechnicalSkills={reorderTechnicalSkills}
            reorderSpecializedSkills={reorderSpecializedSkills}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="experience" className="h-full">
          <ExperienceTab
            experiences={experiences}
            saveExperience={saveExperience}
            updateExperience={updateExperience}
            deleteExperience={deleteExperience}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="education" className="h-full">
          <EducationTab
            education={education}
            saveEducation={saveEducation}
            updateEducation={updateEducation}
            deleteEducation={deleteEducation}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="training" className="h-full">
          <TrainingTab
            trainings={trainings}
            saveTraining={saveTraining}
            updateTraining={updateTraining}
            deleteTraining={deleteTraining}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="achievements" className="h-full">
          <AchievementTab
            achievements={achievements}
            saveAchievement={saveAchievement}
            updateAchievement={updateAchievement}
            deleteAchievement={deleteAchievement}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="projects" className="h-full">
          <ProjectTab
            projects={projects}
            saveProject={saveProject}
            updateProject={updateProject}
            deleteProject={deleteProject}
            reorderProjects={reorderProjects}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="cv-import" className="h-full">
          <CVImportTab
            onImportSuccess={() => {
              // Refresh the page or trigger a data reload
              window.location.reload();
            }}
            {...cvImportHandlers}
          />
        </TabsContent>

        <TabsContent value="import-export" className="h-full">
          <JSONImportExportTab
            onImportSuccess={() => {
              // Refresh the page or trigger a data reload
              window.location.reload();
            }}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};
