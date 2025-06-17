
import { useToast } from '@/hooks/use-toast';
import { ProfileJSONData } from '@/services/profile/ProfileJSONService';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';

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

export function useProfileImport(handlers: ImportHandlers) {
  const { toast } = useToast();

  const importProfile = async (data: ProfileJSONData): Promise<boolean> => {
    try {
      // Import general info
      await handlers.saveGeneralInfo({
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        biography: data.personalInfo.biography,
        profileImage: data.personalInfo.profileImage
      });

      // Import technical skills
      for (const skill of data.technicalSkills) {
        await handlers.saveTechnicalSkill({
          id: '', // Will be generated
          name: skill.name,
          proficiency: skill.proficiency,
          priority: 0 // Will be set automatically
        });
      }

      // Import specialized skills
      for (const skill of data.specializedSkills) {
        await handlers.saveSpecializedSkill({
          id: '', // Will be generated
          name: skill.name,
          proficiency: skill.proficiency,
          priority: 0
        });
      }

      // Import experiences
      for (const exp of data.experiences) {
        await handlers.saveExperience({
          companyName: exp.companyName,
          designation: exp.designation,
          description: exp.description,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          isCurrent: exp.isCurrent
        });
      }

      // Import education
      for (const edu of data.education) {
        await handlers.saveEducation({
          university: edu.university,
          degree: edu.degree,
          department: edu.department,
          gpa: edu.gpa,
          startDate: new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          isCurrent: edu.isCurrent
        });
      }

      // Import trainings
      for (const training of data.trainings) {
        await handlers.saveTraining({
          title: training.title,
          provider: training.provider,
          description: training.description,
          date: new Date(training.date),
          certificateUrl: training.certificateUrl
        });
      }

      // Import achievements
      for (const achievement of data.achievements) {
        await handlers.saveAchievement({
          title: achievement.title,
          description: achievement.description,
          date: new Date(achievement.date)
        });
      }

      // Import projects
      for (const project of data.projects) {
        await handlers.saveProject({
          name: project.name,
          role: project.role,
          description: project.description,
          responsibility: project.responsibility || '', // Add default value for responsibility
          startDate: new Date(project.startDate),
          endDate: project.endDate ? new Date(project.endDate) : undefined,
          isCurrent: project.isCurrent,
          technologiesUsed: project.technologiesUsed,
          url: project.url
        });
      }

      return true;
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Error',
        description: 'Some data could not be imported. Please check the console for details.',
        variant: 'destructive'
      });
      return false;
    }
  };

  return { importProfile };
}
