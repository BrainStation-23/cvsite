export interface MappedEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  biography: string;
  currentDesignation: string;
  profileImage: string;
  technicalSkills: Array<{
    id: string;
    name: string;
    proficiency: number;
    priority: number;
  }>;
  specializedSkills: Array<{
    id: string;
    name: string;
    proficiency: number;
    priority: number;
  }>;
  experiences: Array<{
    id: string;
    companyName: string;
    designation: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    university: string;
    degree: string;
    department: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    gpa: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    role: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
    technologiesUsed: string[];
    url: string;
    displayOrder: number;
    responsibility: string;
  }>;
  trainings: Array<{
    id: string;
    title: string;
    provider: string;
    certificationDate: string;
    description: string;
    certificateUrl: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    date: string;
    description: string;
  }>;
}

// Raw API types (snake_case) as observed from mapping logic
interface RawGeneralInformation {
  first_name?: unknown;
  last_name?: unknown;
  biography?: unknown;
  current_designation?: unknown;
  profile_image?: unknown;
}

interface RawSkill {
  id?: unknown;
  name?: unknown;
  proficiency?: unknown;
  priority?: unknown;
}

interface RawExperience {
  id?: unknown;
  company_name?: unknown;
  designation?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  is_current?: unknown;
  description?: unknown;
}

interface RawEducation {
  id?: unknown;
  university?: unknown;
  degree?: unknown;
  department?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  is_current?: unknown;
  gpa?: unknown;
}

interface RawProject {
  id?: unknown;
  name?: unknown;
  role?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  is_current?: unknown;
  description?: unknown;
  technologies_used?: unknown; // string[] | string | unknown
  url?: unknown;
  display_order?: unknown;
  responsibility?: unknown;
}

interface RawTraining {
  id?: unknown;
  title?: unknown;
  provider?: unknown;
  certification_date?: unknown;
  description?: unknown;
  certificate_url?: unknown;
}

interface RawAchievement {
  id?: unknown;
  title?: unknown;
  date?: unknown;
  description?: unknown;
}

interface RawEmployeeData {
  first_name?: unknown;
  last_name?: unknown;
  email?: unknown;
  employee_id?: unknown;
  biography?: unknown;
  current_designation?: unknown;
  profile_image?: unknown;
  general_information?: RawGeneralInformation | null;
  technical_skills?: unknown; // RawSkill[] | unknown
  specialized_skills?: unknown; // RawSkill[] | unknown
  experiences?: unknown; // RawExperience[] | unknown
  education?: unknown; // RawEducation[] | unknown
  projects?: unknown; // RawProject[] | unknown
  trainings?: unknown; // RawTraining[] | unknown
  achievements?: unknown; // RawAchievement[] | unknown
}

const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const safeArray = <T = unknown>(value: unknown): T[] => {
  if (!Array.isArray(value)) return [] as T[];
  return value as T[];
};

export const mapEmployeeData = (rawData: RawEmployeeData | null | undefined): MappedEmployeeData => {
  if (!rawData) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      employeeId: '',
      biography: '',
      currentDesignation: '',
      profileImage: '',
      technicalSkills: [],
      specializedSkills: [],
      experiences: [],
      education: [],
      projects: [],
      trainings: [],
      achievements: []
    };
  }

  return {
    firstName: safeString(rawData.first_name || rawData.general_information?.first_name),
    lastName: safeString(rawData.last_name || rawData.general_information?.last_name),
    email: safeString(rawData.email),
    employeeId: safeString(rawData.employee_id),
    biography: safeString(rawData.biography || rawData.general_information?.biography),
    currentDesignation: safeString(rawData.current_designation || rawData.general_information?.current_designation),
    profileImage: safeString(rawData.profile_image || rawData.general_information?.profile_image),
    
    technicalSkills: safeArray<RawSkill>(rawData.technical_skills).map((skill) => ({
      id: safeString(skill?.id),
      name: safeString(skill?.name),
      proficiency: Number((skill?.proficiency as unknown) ?? 0) || 0,
      priority: Number((skill?.priority as unknown) ?? 0) || 0
    })),
    
    specializedSkills: safeArray<RawSkill>(rawData.specialized_skills).map((skill) => ({
      id: safeString(skill?.id),
      name: safeString(skill?.name),
      proficiency: Number((skill?.proficiency as unknown) ?? 0) || 0,
      priority: Number((skill?.priority as unknown) ?? 0) || 0
    })),
    
    experiences: safeArray<RawExperience>(rawData.experiences).map((exp) => ({
      id: safeString(exp?.id),
      companyName: safeString(exp?.company_name),
      designation: safeString(exp?.designation),
      startDate: safeString(exp?.start_date),
      endDate: safeString(exp?.end_date),
      isCurrent: Boolean(exp?.is_current) || false,
      description: safeString(exp?.description)
    })),
    
    education: safeArray<RawEducation>(rawData.education).map((edu) => ({
      id: safeString(edu?.id),
      university: safeString(edu?.university),
      degree: safeString(edu?.degree),
      department: safeString(edu?.department),
      startDate: safeString(edu?.start_date),
      endDate: safeString(edu?.end_date),
      isCurrent: Boolean(edu?.is_current) || false,
      gpa: safeString(edu?.gpa)
    })),
    
    projects: safeArray<RawProject>(rawData.projects).map((proj) => ({
      id: safeString(proj?.id),
      name: safeString(proj?.name),
      role: safeString(proj?.role),
      startDate: safeString(proj?.start_date),
      endDate: safeString(proj?.end_date),
      isCurrent: Boolean(proj?.is_current) || false,
      description: safeString(proj?.description),
      technologiesUsed: Array.isArray(proj?.technologies_used)
        ? (proj?.technologies_used as unknown[]).map(safeString)
        : (proj?.technologies_used ? safeString(proj?.technologies_used).split(',').map((t: string) => t.trim()) : []),
      url: safeString(proj?.url),
      displayOrder: Number((proj?.display_order as unknown) ?? 0) || 0,
      responsibility: safeString(proj?.responsibility)
    })),
    
    trainings: safeArray<RawTraining>(rawData.trainings).map((training) => ({
      id: safeString(training?.id),
      title: safeString(training?.title),
      provider: safeString(training?.provider),
      certificationDate: safeString(training?.certification_date),
      description: safeString(training?.description),
      certificateUrl: safeString(training?.certificate_url)
    })),
    
    achievements: safeArray<RawAchievement>(rawData.achievements).map((achievement) => ({
      id: safeString(achievement?.id),
      title: safeString(achievement?.title),
      date: safeString(achievement?.date),
      description: safeString(achievement?.description)
    }))
  };
};
