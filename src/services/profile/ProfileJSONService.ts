
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
    description?: string | null;
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

// Input interfaces (allowing mixed snake_case/camelCase and Date values)
interface GeneralInfoInput {
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  biography?: string | null;
  profileImage?: string | null;
  profile_image?: string | null;
  currentDesignation?: string | null;
  current_designation?: string | null;
}

interface SkillInput {
  name: string;
  proficiency: number;
}

interface ExperienceInput {
  companyName?: string;
  company_name?: string;
  designation: string;
  description?: string | null;
  startDate?: string | Date;
  endDate?: string | Date;
  start_date?: string;
  end_date?: string;
  isCurrent?: boolean;
  is_current?: boolean;
}

interface EducationInput {
  university: string;
  degree?: string | null;
  department?: string | null;
  gpa?: string | null;
  startDate?: string | Date;
  endDate?: string | Date;
  start_date?: string;
  end_date?: string;
  isCurrent?: boolean;
  is_current?: boolean;
}

interface TrainingInput {
  title: string;
  provider?: string | null;
  description?: string | null;
  date?: string | Date;
  certification_date?: string;
  certificateUrl?: string | null;
  certificate_url?: string | null;
}

interface AchievementInput {
  title: string;
  description?: string | null;
  date?: string | Date;
}

interface ProjectInput {
  name: string;
  role?: string | null;
  description: string;
  responsibility?: string | null;
  startDate?: string | Date;
  endDate?: string | Date;
  start_date?: string;
  end_date?: string;
  isCurrent?: boolean;
  is_current?: boolean;
  technologiesUsed?: string[];
  technologies_used?: string[];
  url?: string | null;
}

export class ProfileJSONService {
  static exportProfile(profileData: {
    generalInfo: GeneralInfoInput;
    technicalSkills: SkillInput[];
    specializedSkills: SkillInput[];
    experiences: ExperienceInput[];
    education: EducationInput[];
    trainings: TrainingInput[];
    achievements: AchievementInput[];
    projects: ProjectInput[];
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
        description: achievement.description || null,
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
    const dateToYMD = (d?: Date): string | undefined => (d ? d.toISOString().split('T')[0] : undefined);

    const cleanedGeneral = ProfileImportDataCleaner.cleanPersonalInfo(data.generalInfo);
    const cleanedTech = data.technicalSkills
      .filter(skill => skill.name && skill.name.trim() !== '')
      .map(skill => ProfileImportDataCleaner.cleanSkill(skill));
    const cleanedSpec = data.specializedSkills
      .filter(skill => skill.name && skill.name.trim() !== '')
      .map(skill => ProfileImportDataCleaner.cleanSkill(skill));
    const cleanedExp = data.experiences
      .filter(exp => exp.companyName && exp.companyName.trim() !== '' && exp.designation && exp.designation.trim() !== '')
      .map(exp => ProfileImportDataCleaner.cleanExperience(exp))
      .map(exp => ({
        companyName: exp.companyName,
        designation: exp.designation,
        description: exp.description ?? undefined,
        startDate: dateToYMD(exp.startDate),
        endDate: dateToYMD(exp.endDate),
        isCurrent: exp.isCurrent,
      }));
    const cleanedEdu = data.education
      .filter(edu => edu.university && edu.university.trim() !== '')
      .map(edu => ProfileImportDataCleaner.cleanEducation(edu))
      .map(edu => ({
        university: edu.university,
        degree: edu.degree ?? undefined,
        department: edu.department ?? undefined,
        gpa: edu.gpa ?? undefined,
        startDate: dateToYMD(edu.startDate),
        endDate: dateToYMD(edu.endDate),
        isCurrent: edu.isCurrent,
      }));
    const cleanedTrainings = data.trainings
      .filter(training => training.title && training.title.trim() !== '')
      .map(training => ProfileImportDataCleaner.cleanTraining(training))
      .map(t => ({
        title: t.title,
        provider: t.provider ?? undefined,
        description: t.description ?? undefined,
        date: dateToYMD(t.date),
        certificateUrl: t.certificateUrl ?? undefined,
      }));
    const cleanedAchievements = data.achievements
      .filter(achievement => achievement.title && achievement.title.trim() !== '')
      .map(achievement => ProfileImportDataCleaner.cleanAchievement(achievement))
      .map(a => ({
        title: a.title,
        description: a.description ?? undefined,
        date: dateToYMD(a.date),
      }));
    const cleanedProjects = data.projects
      .filter(project => project.name && project.name.trim() !== '' && project.description && project.description.trim() !== '')
      .map(project => ProfileImportDataCleaner.cleanProject(project))
      .map(p => ({
        name: p.name,
        role: p.role ?? undefined,
        description: p.description,
        responsibility: p.responsibility ?? undefined,
        startDate: dateToYMD(p.startDate),
        endDate: dateToYMD(p.endDate),
        isCurrent: p.isCurrent,
        technologiesUsed: p.technologiesUsed,
        url: p.url ?? undefined,
      }));

    return {
      generalInfo: cleanedGeneral,
      technicalSkills: cleanedTech,
      specializedSkills: cleanedSpec,
      experiences: cleanedExp,
      education: cleanedEdu,
      trainings: cleanedTrainings,
      achievements: cleanedAchievements,
      projects: cleanedProjects,
    };
  }

  // Add backward compatibility helper
  static migratePersonalInfoToGeneralInfo(
    data: ProfileJSONData & { personalInfo?: ProfileJSONData['generalInfo'] }
  ): ProfileJSONData {
    if (data.personalInfo && !data.generalInfo) {
      const { personalInfo, ...rest } = data as ProfileJSONData & { personalInfo?: ProfileJSONData['generalInfo'] };
      return {
        ...(rest as ProfileJSONData),
        generalInfo: personalInfo as ProfileJSONData['generalInfo']
      };
    }
    return data;
  }
}
