
import { useState } from 'react';

interface ImportStats {
  successful: number;
  failed: number;
  sections: {
    generalInfo: boolean;
    technicalSkills: number;
    specializedSkills: number;
    experiences: number;
    education: number;
    trainings: number;
    achievements: number;
    projects: number;
  };
}

export const useImportStatistics = () => {
  const [importStats, setImportStats] = useState<ImportStats>({
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
  });

  const incrementSuccessful = () => {
    setImportStats(prev => ({ ...prev, successful: prev.successful + 1 }));
  };

  const incrementFailed = () => {
    setImportStats(prev => ({ ...prev, failed: prev.failed + 1 }));
  };

  const setGeneralInfoStatus = (status: boolean) => {
    setImportStats(prev => ({
      ...prev,
      sections: { ...prev.sections, generalInfo: status }
    }));
  };

  const incrementSection = (section: keyof Omit<ImportStats['sections'], 'generalInfo'>) => {
    setImportStats(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: prev.sections[section] + 1
      }
    }));
  };

  const getTotalImported = () => {
    return importStats.sections.technicalSkills + 
           importStats.sections.specializedSkills + 
           importStats.sections.experiences + 
           importStats.sections.education + 
           importStats.sections.trainings + 
           importStats.sections.achievements + 
           importStats.sections.projects;
  };

  const reset = () => {
    setImportStats({
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
    });
  };

  return {
    importStats,
    incrementSuccessful,
    incrementFailed,
    setGeneralInfoStatus,
    incrementSection,
    getTotalImported,
    reset
  };
};
