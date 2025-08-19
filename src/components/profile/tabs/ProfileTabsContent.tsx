import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { GeneralInfoTab } from '../generalInfo/GeneralInfoTab';
import { SkillsTab } from '../skills/SkillsTab';
import { ExperienceTab } from '../experience/ExperienceTab';
import { EducationTab } from '../education/EducationTab';
import { TrainingTab } from '../training/TrainingTab';
import { AchievementsTab } from '../achievements/AchievementsTab';
import { ProjectsTab } from '../projects/ProjectsTab';
import { ServerSideJSONImportExport } from '../importExport/ServerSideJSONImportExport';
import { CVImportTab } from '../cv-import/CVImportTab';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoFormData } from '../generalInfo/GeneralInfoTab';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';

interface ProfileTabsContentProps {
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
  handleGeneralInfoSave: (data: GeneralInfoFormData) => Promise<boolean>;
  profileData: any;
  onDataChange?: () => void;
}

export const ProfileTabsContent: React.FC<ProfileTabsContentProps> = ({ 
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
  handleGeneralInfoSave,
  profileData,
  onDataChange
}) => {
  return (
    <>
      <TabsContent value="general" className="mt-6">
        <GeneralInfoTab 
          form={form}
          isEditing={isEditing}
          onImageUpdate={onImageUpdate}
          onSave={handleGeneralInfoSave}
          profileId={profileId}
        />
      </TabsContent>

      <TabsContent value="skills" className="mt-6">
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

      <TabsContent value="experience" className="mt-6">
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

      <TabsContent value="education" className="mt-6">
        <EducationTab 
          education={education}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={saveEducation}
          onUpdate={updateEducation}
          onDelete={deleteEducation}
        />
      </TabsContent>

      <TabsContent value="training" className="mt-6">
        <TrainingTab 
          trainings={trainings}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={saveTraining}
          onUpdate={updateTraining}
          onDelete={deleteTraining}
        />
      </TabsContent>

      <TabsContent value="achievements" className="mt-6">
        <AchievementsTab 
          achievements={achievements}
          isEditing={isEditing}
          isSaving={isSaving}
          onSave={saveAchievement}
          onUpdate={updateAchievement}
          onDelete={deleteAchievement}
        />
      </TabsContent>

      <TabsContent value="projects" className="mt-6">
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

      <TabsContent value="cv-import" className="mt-6">
        <CVImportTab 
          profileId={profileId}
          onImportSuccess={onDataChange} 
        />
      </TabsContent>

      <TabsContent value="json" className="mt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Import/Export Profile Data</h2>
            <p className="text-muted-foreground mb-6">
              Import or export your complete profile data as JSON. All operations are processed securely on the server.
            </p>
          </div>
          
          <ServerSideJSONImportExport 
            profileId={profileId}
            onImportSuccess={onDataChange}
          />
        </div>
      </TabsContent>
    </>
  );
};
