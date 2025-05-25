import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralInfoTab, GeneralInfoFormData } from './GeneralInfoTab';
import { SkillsTab } from './SkillsTab';
import { ExperienceTab } from './ExperienceTab';
import { EducationTab } from './EducationTab';
import { TrainingTab } from './training/TrainingTab';
import { AchievementsTab } from './AchievementsTab';
import { ProjectsTab } from './ProjectsTab';
import { UseFormReturn } from 'react-hook-form';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';
import { Card } from '@/components/ui/card';
import { User, Briefcase, GraduationCap, Award, FolderOpen, Zap, BookOpen } from 'lucide-react';

// Update the form type to match GeneralInfoFormData and add missing props
interface ProfileTabsProps {
  form: UseFormReturn<GeneralInfoFormData>;
  isEditing: boolean;
  profileId?: string;
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
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  form,
  isEditing,
  profileId,
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
  deleteSpecializedSkill
}) => {
  const tabItems = [
    { value: "general", label: "General", icon: User },
    { value: "skills", label: "Skills", icon: Zap },
    { value: "experience", label: "Experience", icon: Briefcase },
    { value: "education", label: "Education", icon: GraduationCap },
    { value: "training", label: "Training", icon: BookOpen },
    { value: "achievements", label: "Achievements", icon: Award },
    { value: "projects", label: "Projects", icon: FolderOpen }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
      <Tabs defaultValue="general" className="w-full">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4">
          <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-lg p-1 shadow-sm">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <TabsTrigger 
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-cvsite-navy dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white hover:bg-white/70 dark:hover:bg-slate-700/70"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        
        <div className="p-6">
          <TabsContent value="general" className="mt-0">
            <GeneralInfoTab 
              form={form} 
              isEditing={isEditing} 
              profileId={profileId}
              onImageUpdate={onImageUpdate}
            />
          </TabsContent>
          
          <TabsContent value="skills" className="mt-0">
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
            />
          </TabsContent>
          
          <TabsContent value="experience" className="mt-0">
            <ExperienceTab
              experiences={experiences}
              isEditing={isEditing}
              isSaving={isSaving}
              onSave={saveExperience}
              onUpdate={updateExperience}
              onDelete={deleteExperience}
            />
          </TabsContent>
          
          <TabsContent value="education" className="mt-0">
            <EducationTab
              education={education}
              isEditing={isEditing}
              isSaving={isSaving}
              onSave={saveEducation}
              onUpdate={updateEducation}
              onDelete={deleteEducation}
            />
          </TabsContent>
          
          <TabsContent value="training" className="mt-0">
            <TrainingTab
              trainings={trainings}
              isEditing={isEditing}
              isSaving={isSaving}
              onSave={saveTraining}
              onUpdate={updateTraining}
              onDelete={deleteTraining}
            />
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-0">
            <AchievementsTab
              achievements={achievements}
              isEditing={isEditing}
              isSaving={isSaving}
              onSave={saveAchievement}
              onUpdate={updateAchievement}
              onDelete={deleteAchievement}
            />
          </TabsContent>
          
          <TabsContent value="projects" className="mt-0">
            <ProjectsTab
              projects={projects}
              isEditing={isEditing}
              isSaving={isSaving}
              onSave={saveProject}
              onUpdate={updateProject}
              onDelete={deleteProject}
            />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};
