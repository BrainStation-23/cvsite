export interface ProfileJSONData {
  personalInfo: {
    firstName: string;
    lastName: string;
    biography: string;
    profileImage?: string;
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
    description: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
  }>;
  education: Array<{
    university: string;
    degree: string;
    department?: string;
    gpa?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
  }>;
  trainings: Array<{
    title: string;
    provider: string;
    description?: string;
    date: string;
    certificateUrl?: string;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    date: string;
  }>;
  projects: Array<{
    name: string;
    role: string;
    description: string;
    responsibility?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    technologiesUsed: string[];
    url?: string;
  }>;
}

export interface ProjectJSON {
  name: string;
  role: string;
  description: string;
  responsibility?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  technologiesUsed: string[];
  url?: string;
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
      personalInfo: {
        firstName: profileData.generalInfo?.firstName || profileData.generalInfo?.first_name || '',
        lastName: profileData.generalInfo?.lastName || profileData.generalInfo?.last_name || '',
        biography: profileData.generalInfo?.biography || '',
        profileImage: profileData.generalInfo?.profileImage || profileData.generalInfo?.profile_image
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
        description: exp.description || '',
        startDate: exp.startDate instanceof Date ? exp.startDate.toISOString().split('T')[0] : exp.start_date,
        endDate: exp.endDate ? (exp.endDate instanceof Date ? exp.endDate.toISOString().split('T')[0] : exp.end_date) : undefined,
        isCurrent: exp.isCurrent || exp.is_current || false
      })),
      education: profileData.education.map(edu => ({
        university: edu.university,
        degree: edu.degree || '',
        department: edu.department || '',
        gpa: edu.gpa || '',
        startDate: edu.startDate instanceof Date ? edu.startDate.toISOString().split('T')[0] : edu.start_date,
        endDate: edu.endDate ? (edu.endDate instanceof Date ? edu.endDate.toISOString().split('T')[0] : edu.end_date) : undefined,
        isCurrent: edu.isCurrent || edu.is_current || false
      })),
      trainings: profileData.trainings.map(training => ({
        title: training.title,
        provider: training.provider,
        description: training.description || '',
        date: training.date instanceof Date ? training.date.toISOString().split('T')[0] : training.certification_date,
        certificateUrl: training.certificateUrl || training.certificate_url
      })),
      achievements: profileData.achievements.map(achievement => ({
        title: achievement.title,
        description: achievement.description,
        date: achievement.date instanceof Date ? achievement.date.toISOString().split('T')[0] : achievement.date
      })),
      projects: profileData.projects.map(project => ({
        name: project.name,
        role: project.role,
        description: project.description,
        responsibility: project.responsibility || '',
        startDate: project.startDate instanceof Date ? project.startDate.toISOString().split('T')[0] : project.start_date,
        endDate: project.endDate ? (project.endDate instanceof Date ? project.endDate.toISOString().split('T')[0] : project.end_date) : undefined,
        isCurrent: project.isCurrent || project.is_current || false,
        technologiesUsed: project.technologiesUsed || project.technologies_used || [],
        url: project.url
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

 
}
