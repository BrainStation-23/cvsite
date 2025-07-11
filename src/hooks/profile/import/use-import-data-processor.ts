
import { ProfileJSONData } from '@/services/profile/ProfileJSONService';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';
import { ensureDate } from './use-import-date-utils';

interface ImportHandlers {
  saveGeneralInfo: (data: any) => Promise<boolean>;
  saveTechnicalSkill: (skill: Skill) => Promise<boolean>;
  saveSpecializedSkill: (skill: Skill) => Promise<boolean>;
  saveExperience: (experience: Omit<Experience, 'id'>) => Promise<boolean>;
  saveEducation: (education: Omit<Education, 'id'>) => Promise<boolean>;
  saveTraining: (training: Omit<Training, 'id'>) => Promise<boolean>;
  saveAchievement: (achievement: Omit<Achievement, 'id'>) => Promise<boolean>;
  saveProject: (project: Omit<Project, 'id'>) => Promise<boolean>;
}

interface ImportStatsActions {
  incrementSuccessful: () => void;
  incrementFailed: () => void;
  setGeneralInfoStatus: (status: boolean) => void;
  incrementSection: (section: string) => void;
}

export const useImportDataProcessor = () => {
  const processGeneralInfo = async (
    data: ProfileJSONData, 
    handlers: ImportHandlers, 
    stats: ImportStatsActions
  ) => {
    try {
      const success = await handlers.saveGeneralInfo({
        firstName: data.generalInfo.firstName,
        lastName: data.generalInfo.lastName,
        biography: data.generalInfo.biography || '',
        profileImage: data.generalInfo.profileImage || '',
        currentDesignation: data.generalInfo.current_designation || null
      });
      stats.setGeneralInfoStatus(success);
      if (success) stats.incrementSuccessful();
      else stats.incrementFailed();
    } catch (error) {
      console.error('Failed to import general info:', error);
      stats.incrementFailed();
    }
  };

  const processTechnicalSkills = async (
    skills: any[], 
    handlers: ImportHandlers, 
    stats: ImportStatsActions
  ) => {
    for (const skill of skills) {
      try {
        const success = await handlers.saveTechnicalSkill({
          id: '', // Will be generated
          name: skill.name,
          proficiency: skill.proficiency,
          priority: 0 // Will be set automatically
        });
        if (success) stats.incrementSection('technicalSkills');
      } catch (error) {
        console.error('Failed to import technical skill:', skill.name, error);
      }
    }
  };

  const processSpecializedSkills = async (
    skills: any[], 
    handlers: ImportHandlers, 
    stats: ImportStatsActions
  ) => {
    for (const skill of skills) {
      try {
        const success = await handlers.saveSpecializedSkill({
          id: '', // Will be generated
          name: skill.name,
          proficiency: skill.proficiency,
          priority: 0
        });
        if (success) stats.incrementSection('specializedSkills');
      } catch (error) {
        console.error('Failed to import specialized skill:', skill.name, error);
      }
    }
  };

  const processExperiences = async (
    experiences: any[], 
    handlers: ImportHandlers, 
    stats: ImportStatsActions
  ) => {
    for (const exp of experiences) {
      try {
        const success = await handlers.saveExperience({
          companyName: exp.companyName,
          designation: exp.designation || null, // Let RPC function handle validation
          description: exp.description || '',
          startDate: ensureDate(exp.startDate) || new Date(),
          endDate: ensureDate(exp.endDate),
          isCurrent: exp.isCurrent || false
        });
        if (success) stats.incrementSection('experiences');
      } catch (error) {
        console.error('Failed to import experience:', exp.companyName, error);
      }
    }
  };

  const processEducation = async (
    education: any[], 
    handlers: ImportHandlers, 
    stats: ImportStatsActions
  ) => {
    for (const edu of education) {
      try {
        const success = await handlers.saveEducation({
          university: edu.university,
          degree: edu.degree || '',
          department: edu.department || '',
          gpa: edu.gpa || '',
          startDate: ensureDate(edu.startDate) || new Date(),
          endDate: ensureDate(edu.endDate),
          isCurrent: edu.isCurrent || false
        });
        if (success) stats.incrementSection('education');
      } catch (error) {
        console.error('Failed to import education:', edu.university, error);
      }
    }
  };

  const processTrainings = async (
    trainings: any[], 
    handlers: ImportHandlers, 
    stats: ImportStatsActions
  ) => {
    for (const training of trainings) {
      try {
        const success = await handlers.saveTraining({
          title: training.title,
          provider: training.provider || '',
          description: training.description || '',
          date: ensureDate(training.date) || new Date(),
          certificateUrl: training.certificateUrl || ''
        });
        if (success) stats.incrementSection('trainings');
      } catch (error) {
        console.error('Failed to import training:', training.title, error);
      }
    }
  };

  const processAchievements = async (
    achievements: any[], 
    handlers: ImportHandlers, 
    stats: ImportStatsActions
  ) => {
    for (const achievement of achievements) {
      try {
        const success = await handlers.saveAchievement({
          title: achievement.title,
          description: achievement.description,
          date: ensureDate(achievement.date) || new Date()
        });
        if (success) stats.incrementSection('achievements');
      } catch (error) {
        console.error('Failed to import achievement:', achievement.title, error);
      }
    }
  };

  const processProjects = async (
    projects: any[], 
    handlers: ImportHandlers, 
    stats: ImportStatsActions
  ) => {
    for (const project of projects) {
      try {
        const success = await handlers.saveProject({
          name: project.name,
          role: project.role || '',
          description: project.description,
          responsibility: project.responsibility || '',
          startDate: ensureDate(project.startDate) || new Date(),
          endDate: ensureDate(project.endDate),
          isCurrent: project.isCurrent || false,
          technologiesUsed: project.technologiesUsed || [],
          url: project.url || ''
        });
        if (success) stats.incrementSection('projects');
      } catch (error) {
        console.error('Failed to import project:', project.name, error);
      }
    }
  };

  return {
    processGeneralInfo,
    processTechnicalSkills,
    processSpecializedSkills,
    processExperiences,
    processEducation,
    processTrainings,
    processAchievements,
    processProjects
  };
};
