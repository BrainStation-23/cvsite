
import { useToast } from '@/hooks/use-toast';
import { ProfileJSONData, ProfileJSONService } from '@/services/profile/ProfileJSONService';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';
import { useImportStatistics } from './import/use-import-statistics';
import { useImportDataProcessor } from './import/use-import-data-processor';

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
  const {
    importStats,
    incrementSuccessful,
    incrementFailed,
    setGeneralInfoStatus,
    incrementSection,
    getTotalImported,
    reset
  } = useImportStatistics();

  const {
    processGeneralInfo,
    processTechnicalSkills,
    processSpecializedSkills,
    processExperiences,
    processEducation,
    processTrainings,
    processAchievements,
    processProjects
  } = useImportDataProcessor();

  const importProfile = async (data: ProfileJSONData | any): Promise<boolean> => {
    try {
      console.log('Starting profile import with data:', data);
      
      // Handle backward compatibility - migrate personalInfo to generalInfo
      let migratedData = data;
      if ((data as any).personalInfo && !(data as any).generalInfo) {
        console.log('Migrating personalInfo to generalInfo for backward compatibility');
        migratedData = ProfileJSONService.migratePersonalInfoToGeneralInfo(data);
        toast({
          title: 'Data Format Updated',
          description: 'Your data format has been automatically updated to the current standard.',
        });
      }
      
      // Clean and validate data before importing
      const cleanedData = ProfileJSONService.cleanImportData(migratedData as ProfileJSONData);
      console.log('Cleaned data:', cleanedData);

      // Reset stats for new import
      reset();

      const statsActions = {
        incrementSuccessful,
        incrementFailed,
        setGeneralInfoStatus,
        incrementSection
      };

      // Process all sections
      await processGeneralInfo(cleanedData, handlers, statsActions);
      await processTechnicalSkills(cleanedData.technicalSkills, handlers, statsActions);
      await processSpecializedSkills(cleanedData.specializedSkills, handlers, statsActions);
      await processExperiences(cleanedData.experiences, handlers, statsActions);
      await processEducation(cleanedData.education, handlers, statsActions);
      await processTrainings(cleanedData.trainings, handlers, statsActions);
      await processAchievements(cleanedData.achievements, handlers, statsActions);
      await processProjects(cleanedData.projects, handlers, statsActions);

      // Show detailed success message
      const totalImported = getTotalImported();

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
