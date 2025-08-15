
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
    endDate: string | null;
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
    endDate: string | null;
    isCurrent: boolean;
    description: string;
    technologiesUsed: string[];
    url: string | null;
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

export const mapEmployeeData = (rawData: any): MappedEmployeeData => {
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
    firstName: rawData.first_name || rawData.general_information?.first_name || '',
    lastName: rawData.last_name || rawData.general_information?.last_name || '',
    email: rawData.email || '',
    employeeId: rawData.employee_id || '',
    biography: rawData.biography || rawData.general_information?.biography || '',
    currentDesignation: rawData.current_designation || rawData.general_information?.current_designation || '',
    profileImage: rawData.profile_image || rawData.general_information?.profile_image || '',
    
    technicalSkills: (rawData.technical_skills || []).map((skill: any) => ({
      id: skill.id || '',
      name: skill.name || '',
      proficiency: skill.proficiency || 0,
      priority: skill.priority || 0
    })),
    
    specializedSkills: (rawData.specialized_skills || []).map((skill: any) => ({
      id: skill.id || '',
      name: skill.name || '',
      proficiency: skill.proficiency || 0,
      priority: skill.priority || 0
    })),
    
    experiences: (rawData.experiences || []).map((exp: any) => ({
      id: exp.id || '',
      companyName: exp.company_name || '',
      designation: exp.designation || '',
      startDate: exp.start_date || '',
      endDate: exp.end_date,
      isCurrent: exp.is_current || false,
      description: exp.description || ''
    })),
    
    education: (rawData.education || []).map((edu: any) => ({
      id: edu.id || '',
      university: edu.university || '',
      degree: edu.degree || '',
      department: edu.department || '',
      startDate: edu.start_date || '',
      endDate: edu.end_date || '',
      isCurrent: edu.is_current || false,
      gpa: edu.gpa || ''
    })),
    
    projects: (rawData.projects || []).map((proj: any) => ({
      id: proj.id || '',
      name: proj.name || '',
      role: proj.role || '',
      startDate: proj.start_date || '',
      endDate: proj.end_date,
      isCurrent: proj.is_current || false,
      description: proj.description || '',
      technologiesUsed: Array.isArray(proj.technologies_used) 
        ? proj.technologies_used 
        : (proj.technologies_used ? proj.technologies_used.split(',').map((t: string) => t.trim()) : []),
      url: proj.url,
      displayOrder: proj.display_order || 0,
      responsibility: proj.responsibility || ''
    })),
    
    trainings: (rawData.trainings || []).map((training: any) => ({
      id: training.id || '',
      title: training.title || '',
      provider: training.provider || '',
      certificationDate: training.certification_date || '',
      description: training.description || '',
      certificateUrl: training.certificate_url || ''
    })),
    
    achievements: (rawData.achievements || []).map((achievement: any) => ({
      id: achievement.id || '',
      title: achievement.title || '',
      date: achievement.date || '',
      description: achievement.description || ''
    }))
  };
};
