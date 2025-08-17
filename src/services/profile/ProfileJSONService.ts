
import { ProfileImportDataCleaner } from './ProfileImportDataCleaner';

export interface ProfileJSONData {
  generalInfo: {
    firstName: string;
    lastName: string;
    biography?: string | null;
    profileImage?: string | null;
    current_designation?: string | null;
  };
  technicalSkills: Array<{
    name: string;
    proficiency: number;
  }>;
  specializedSkills: Array<{
    name: string;
    proficiency: number;
  }>;
  experiences: Array<{
    companyName: string;
    designation: string;
    description?: string | null;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  }>;
  education: Array<{
    university: string;
    degree?: string | null;
    department?: string | null;
    gpa?: string | null;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
  }>;
  trainings: Array<{
    title: string;
    provider?: string | null;
    description?: string | null;
    date?: string;
    certificateUrl?: string | null;
  }>;
  achievements: Array<{
    title: string;
    description: string | null;
    date?: string;
  }>;
  projects: Array<{
    name: string;
    role?: string | null;
    description: string;
    responsibility?: string | null;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    technologiesUsed?: string[];
    url?: string | null;
  }>;
}

export interface ProjectJSON {
  name: string;
  role?: string | null;
  description: string;
  responsibility?: string | null;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  technologiesUsed?: string[];
  url?: string | null;
}

export class ProfileJSONService {
  static exportProfile(profileData: {
    generalInfo: any;
    technicalSkills: any[];
    specializedSkills: any[];
    experiences: any[];
    education: any[];
    trainings: any[];
    achievements: any[];
    projects: any[];
  }): ProfileJSONData {
    return {
      generalInfo: {
        firstName: profileData.generalInfo?.firstName || profileData.generalInfo?.first_name || '',
        lastName: profileData.generalInfo?.lastName || profileData.generalInfo?.last_name || '',
        biography: profileData.generalInfo?.biography || null,
        profileImage: profileData.generalInfo?.profileImage || profileData.generalInfo?.profile_image || null,
        current_designation: profileData.generalInfo?.currentDesignation || profileData.generalInfo?.current_designation || null
      },
      technicalSkills: profileData.technicalSkills.map(skill => ({
        name: skill.name,
        proficiency: skill.proficiency
      })),
      specializedSkills: profileData.specializedSkills.map(skill => ({
        name: skill.name,
        proficiency: skill.proficiency
      })),
      experiences: profileData.experiences.map(exp => ({
        companyName: exp.companyName || exp.company_name,
        designation: exp.designation,
        description: exp.description || null,
        startDate: exp.startDate instanceof Date ? exp.startDate.toISOString().split('T')[0] : exp.start_date,
        endDate: exp.endDate ? (exp.endDate instanceof Date ? exp.endDate.toISOString().split('T')[0] : exp.end_date) : undefined,
        isCurrent: exp.isCurrent || exp.is_current || false
      })),
      education: profileData.education.map(edu => ({
        university: edu.university,
        degree: edu.degree || null,
        department: edu.department || null,
        gpa: edu.gpa || null,
        startDate: edu.startDate instanceof Date ? edu.startDate.toISOString().split('T')[0] : edu.start_date,
        endDate: edu.endDate ? (edu.endDate instanceof Date ? edu.endDate.toISOString().split('T')[0] : edu.end_date) : undefined,
        isCurrent: edu.isCurrent || edu.is_current || false
      })),
      trainings: profileData.trainings.map(training => ({
        title: training.title,
        provider: training.provider || null,
        description: training.description || null,
        date: training.date instanceof Date ? training.date.toISOString().split('T')[0] : training.certification_date,
        certificateUrl: training.certificateUrl || training.certificate_url || null
      })),
      achievements: profileData.achievements.map(achievement => ({
        title: achievement.title,
        description: achievement.description,
        date: achievement.date instanceof Date ? achievement.date.toISOString().split('T')[0] : achievement.date
      })),
      projects: profileData.projects.map(project => ({
        name: project.name,
        role: project.role || null,
        description: project.description,
        responsibility: project.responsibility || null,
        startDate: project.startDate instanceof Date ? project.startDate.toISOString().split('T')[0] : project.start_date,
        endDate: project.endDate ? (project.endDate instanceof Date ? project.endDate.toISOString().split('T')[0] : project.end_date) : undefined,
        isCurrent: project.isCurrent || project.is_current || false,
        technologiesUsed: project.technologiesUsed || project.technologies_used || [],
        url: project.url || null
      }))
    };
  }

  static downloadJSON(data: ProfileJSONData, filename: string = 'profile') {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static cleanImportData(data: ProfileJSONData): ProfileJSONData {
    return {
      generalInfo: ProfileImportDataCleaner.cleanPersonalInfo(data.generalInfo),
      technicalSkills: data.technicalSkills
        .filter(skill => skill.name && skill.name.trim() !== '') // Only filter on required field
        .map(skill => ProfileImportDataCleaner.cleanSkill(skill)),
      specializedSkills: data.specializedSkills
        .filter(skill => skill.name && skill.name.trim() !== '') // Only filter on required field
        .map(skill => ProfileImportDataCleaner.cleanSkill(skill)),
      experiences: data.experiences
        .filter(exp => exp.companyName && exp.companyName.trim() !== '' && exp.designation && exp.designation.trim() !== '') // Only filter on required fields
        .map(exp => ProfileImportDataCleaner.cleanExperience(exp)),
      education: data.education
        .filter(edu => edu.university && edu.university.trim() !== '') // Only filter on required field
        .map(edu => ProfileImportDataCleaner.cleanEducation(edu)),
      trainings: data.trainings
        .filter(training => training.title && training.title.trim() !== '') // Only filter on required field
        .map(training => ProfileImportDataCleaner.cleanTraining(training)),
      achievements: data.achievements
        .filter(achievement => achievement.title && achievement.title.trim() !== '' && achievement.description && achievement.description.trim() !== '') // Only filter on required fields
        .map(achievement => ProfileImportDataCleaner.cleanAchievement(achievement)),
      projects: data.projects
        .filter(project => project.name && project.name.trim() !== '' && project.description && project.description.trim() !== '') // Only filter on required fields
        .map(project => ProfileImportDataCleaner.cleanProject(project))
    };
  }

  // Add backward compatibility helper
  static migratePersonalInfoToGeneralInfo(data: any): ProfileJSONData {
    if (data.personalInfo && !data.generalInfo) {
      return {
        ...data,
        generalInfo: data.personalInfo,
        personalInfo: undefined
      };
    }
    return data;
  }
}
