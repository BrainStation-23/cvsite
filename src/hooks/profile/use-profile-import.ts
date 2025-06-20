
import { useToast } from '@/hooks/use-toast';
import { ProfileJSONData, ProfileJSONService } from '@/services/profile/ProfileJSONService';
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
      console.log('Starting profile import with data:', data);
      
      // Clean and validate data before importing
      const cleanedData = ProfileJSONService.cleanImportData(data);
      console.log('Cleaned data:', cleanedData);

      let importStats = {
        successful: 0,
        failed: 0,
        sections: {
          generalInfo: false,
          technicalSkills: 0,
          specializedSkills: 0,
          experiences: 0,
          education: 0,
          trainings: 0,
          achievements: 0,
          projects: 0
        }
      };

      // Import general info
      try {
        const success = await handlers.saveGeneralInfo({
          firstName: cleanedData.personalInfo.firstName,
          lastName: cleanedData.personalInfo.lastName,
          biography: cleanedData.personalInfo.biography || '',
          profileImage: cleanedData.personalInfo.profileImage || '',
          currentDesignation: cleanedData.personalInfo.currentDesignation || null
        });
        importStats.sections.generalInfo = success;
        if (success) importStats.successful++;
        else importStats.failed++;
      } catch (error) {
        console.error('Failed to import general info:', error);
        importStats.failed++;
      }

      // Import technical skills
      for (const skill of cleanedData.technicalSkills) {
        try {
          const success = await handlers.saveTechnicalSkill({
            id: '', // Will be generated
            name: skill.name,
            proficiency: skill.proficiency,
            priority: 0 // Will be set automatically
          });
          if (success) importStats.sections.technicalSkills++;
        } catch (error) {
          console.error('Failed to import technical skill:', skill.name, error);
        }
      }

      // Import specialized skills
      for (const skill of cleanedData.specializedSkills) {
        try {
          const success = await handlers.saveSpecializedSkill({
            id: '', // Will be generated
            name: skill.name,
            proficiency: skill.proficiency,
            priority: 0
          });
          if (success) importStats.sections.specializedSkills++;
        } catch (error) {
          console.error('Failed to import specialized skill:', skill.name, error);
        }
      }

      // Import experiences
      for (const exp of cleanedData.experiences) {
        try {
          const success = await handlers.saveExperience({
            companyName: exp.companyName,
            designation: exp.designation,
            description: exp.description || '',
            startDate: exp.startDate || new Date(),
            endDate: exp.endDate,
            isCurrent: exp.isCurrent || false
          });
          if (success) importStats.sections.experiences++;
        } catch (error) {
          console.error('Failed to import experience:', exp.companyName, error);
        }
      }

      // Import education
      for (const edu of cleanedData.education) {
        try {
          const success = await handlers.saveEducation({
            university: edu.university,
            degree: edu.degree || '',
            department: edu.department || '',
            gpa: edu.gpa || '',
            startDate: edu.startDate || new Date(),
            endDate: edu.endDate,
            isCurrent: edu.isCurrent || false
          });
          if (success) importStats.sections.education++;
        } catch (error) {
          console.error('Failed to import education:', edu.university, error);
        }
      }

      // Import trainings
      for (const training of cleanedData.trainings) {
        try {
          const success = await handlers.saveTraining({
            title: training.title,
            provider: training.provider || '',
            description: training.description || '',
            date: training.date || new Date(),
            certificateUrl: training.certificateUrl || ''
          });
          if (success) importStats.sections.trainings++;
        } catch (error) {
          console.error('Failed to import training:', training.title, error);
        }
      }

      // Import achievements
      for (const achievement of cleanedData.achievements) {
        try {
          const success = await handlers.saveAchievement({
            title: achievement.title,
            description: achievement.description,
            date: achievement.date || new Date()
          });
          if (success) importStats.sections.achievements++;
        } catch (error) {
          console.error('Failed to import achievement:', achievement.title, error);
        }
      }

      // Import projects
      for (const project of cleanedData.projects) {
        try {
          const success = await handlers.saveProject({
            name: project.name,
            role: project.role || '',
            description: project.description,
            responsibility: project.responsibility || '',
            startDate: project.startDate || new Date(),
            endDate: project.endDate,
            isCurrent: project.isCurrent || false,
            technologiesUsed: project.technologiesUsed || [],
            url: project.url || ''
          });
          if (success) importStats.sections.projects++;
        } catch (error) {
          console.error('Failed to import project:', project.name, error);
        }
      }

      // Show detailed success message
      const totalImported = importStats.sections.technicalSkills + 
                           importStats.sections.specializedSkills + 
                           importStats.sections.experiences + 
                           importStats.sections.education + 
                           importStats.sections.trainings + 
                           importStats.sections.achievements + 
                           importStats.sections.projects;

      toast({
        title: 'Profile Import Completed',
        description: `Successfully imported ${totalImported} items. General info: ${importStats.sections.generalInfo ? 'Updated' : 'Failed'}, Technical skills: ${importStats.sections.technicalSkills}, Experiences: ${importStats.sections.experiences}, Education: ${importStats.sections.education}, Trainings: ${importStats.sections.trainings}, Achievements: ${importStats.sections.achievements}, Projects: ${importStats.sections.projects}`,
      });

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
