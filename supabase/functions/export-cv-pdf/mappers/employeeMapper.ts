export function mapEmployeeData(rawData: any): any {
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

  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  const safeArray = (value: any): any[] => {
    if (!Array.isArray(value)) return [];
    return value;
  };

  return {
    firstName: safeString(rawData.first_name || rawData.general_information?.first_name),
    lastName: safeString(rawData.last_name || rawData.general_information?.last_name),
    email: safeString(rawData.email),
    employeeId: safeString(rawData.employee_id),
    biography: safeString(rawData.biography || rawData.general_information?.biography),
    currentDesignation: safeString(rawData.current_designation || rawData.general_information?.current_designation),
    profileImage: safeString(rawData.profile_image || rawData.general_information?.profile_image),
    
    technicalSkills: safeArray(rawData.technical_skills).map((skill: any) => ({
      id: safeString(skill.id),
      name: safeString(skill.name),
      proficiency: skill.proficiency || 0,
      priority: skill.priority || 0
    })),
    
    specializedSkills: safeArray(rawData.specialized_skills).map((skill: any) => ({
      id: safeString(skill.id),
      name: safeString(skill.name),
      proficiency: skill.proficiency || 0,
      priority: skill.priority || 0
    })),
    
    experiences: safeArray(rawData.experiences).map((exp: any) => ({
      id: safeString(exp.id),
      companyName: safeString(exp.company_name),
      designation: safeString(exp.designation),
      startDate: safeString(exp.start_date),
      endDate: safeString(exp.end_date),
      isCurrent: exp.is_current || false,
      description: safeString(exp.description)
    })),
    
    education: safeArray(rawData.education).map((edu: any) => ({
      id: safeString(edu.id),
      university: safeString(edu.university),
      degree: safeString(edu.degree),
      department: safeString(edu.department),
      startDate: safeString(edu.start_date),
      endDate: safeString(edu.end_date),
      isCurrent: edu.is_current || false,
      gpa: safeString(edu.gpa)
    })),
    
    projects: safeArray(rawData.projects).map((proj: any) => ({
      id: safeString(proj.id),
      name: safeString(proj.name),
      role: safeString(proj.role),
      startDate: safeString(proj.start_date),
      endDate: safeString(proj.end_date),
      isCurrent: proj.is_current || false,
      description: safeString(proj.description),
      technologiesUsed: Array.isArray(proj.technologies_used) 
        ? proj.technologies_used.map((t: any) => safeString(t))
        : (proj.technologies_used ? safeString(proj.technologies_used).split(',').map((t: string) => t.trim()) : []),
      url: safeString(proj.url),
      displayOrder: proj.display_order || 0,
      responsibility: safeString(proj.responsibility)
    })),
    
    trainings: safeArray(rawData.trainings).map((training: any) => ({
      id: safeString(training.id),
      title: safeString(training.title),
      provider: safeString(training.provider),
      certificationDate: safeString(training.certification_date),
      description: safeString(training.description),
      certificateUrl: safeString(training.certificate_url)
    })),
    
    achievements: safeArray(rawData.achievements).map((achievement: any) => ({
      id: safeString(achievement.id),
      title: safeString(achievement.title),
      date: safeString(achievement.date),
      description: safeString(achievement.description)
    }))
  };
}
