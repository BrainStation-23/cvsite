
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
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    technologiesUsed: string[];
    url?: string;
  }>;
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
        firstName: profileData.generalInfo.firstName || '',
        lastName: profileData.generalInfo.lastName || '',
        biography: profileData.generalInfo.biography || '',
        profileImage: profileData.generalInfo.profileImage || undefined
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
        companyName: exp.companyName,
        designation: exp.designation,
        description: exp.description,
        startDate: exp.startDate.toISOString().split('T')[0],
        endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : undefined,
        isCurrent: exp.isCurrent
      })),
      education: profileData.education.map(edu => ({
        university: edu.university,
        degree: edu.degree,
        department: edu.department,
        gpa: edu.gpa,
        startDate: edu.startDate.toISOString().split('T')[0],
        endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : undefined,
        isCurrent: edu.isCurrent
      })),
      trainings: profileData.trainings.map(training => ({
        title: training.title,
        provider: training.provider,
        description: training.description,
        date: training.date.toISOString().split('T')[0],
        certificateUrl: training.certificateUrl
      })),
      achievements: profileData.achievements.map(achievement => ({
        title: achievement.title,
        description: achievement.description,
        date: achievement.date.toISOString().split('T')[0]
      })),
      projects: profileData.projects.map(project => ({
        name: project.name,
        role: project.role,
        description: project.description,
        startDate: project.startDate.toISOString().split('T')[0],
        endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : undefined,
        isCurrent: project.isCurrent,
        technologiesUsed: project.technologiesUsed,
        url: project.url
      }))
    };
  }

  static generateGeminiPrompt(): string {
    return `You are a profile data extraction assistant. Your task is to extract profile information from a LinkedIn PDF and convert it to the following JSON structure. Please fill in the data based on the information available in the PDF.

JSON Structure to follow:

{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "biography": "Brief professional summary or about section"
  },
  "technicalSkills": [
    {
      "name": "JavaScript",
      "proficiency": 8
    }
  ],
  "specializedSkills": [
    {
      "name": "Project Management",
      "proficiency": 7
    }
  ],
  "experiences": [
    {
      "companyName": "Tech Corp",
      "designation": "Software Engineer",
      "description": "Detailed description of responsibilities and achievements",
      "startDate": "2022-01-15",
      "endDate": "2023-12-31",
      "isCurrent": false
    }
  ],
  "education": [
    {
      "university": "University Name",
      "degree": "Bachelor of Science",
      "department": "Computer Science",
      "gpa": "3.8",
      "startDate": "2018-09-01",
      "endDate": "2022-05-31",
      "isCurrent": false
    }
  ],
  "trainings": [
    {
      "title": "AWS Cloud Practitioner",
      "provider": "Amazon Web Services",
      "description": "Cloud computing fundamentals",
      "date": "2023-06-15"
    }
  ],
  "achievements": [
    {
      "title": "Employee of the Month",
      "description": "Recognized for outstanding performance",
      "date": "2023-08-01"
    }
  ],
  "projects": [
    {
      "name": "E-commerce Platform",
      "role": "Lead Developer",
      "description": "Built a full-stack e-commerce solution",
      "startDate": "2023-01-01",
      "endDate": "2023-06-30",
      "isCurrent": false,
      "technologiesUsed": ["React", "Node.js", "MongoDB"],
      "url": "https://github.com/example/project"
    }
  ]
}

Instructions:
1. Extract all relevant information from the LinkedIn PDF
2. For proficiency levels, use a scale of 1-10 (estimate based on experience level and context)
3. Use ISO date format (YYYY-MM-DD) for all dates
4. Set isCurrent to true for ongoing positions/education
5. Include all skills mentioned, categorizing them as technical or specialized skills
6. For missing information, omit the field rather than using null values
7. Ensure the JSON is properly formatted and valid

Please analyze the provided LinkedIn PDF and return only the JSON object with the extracted information.`;
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

  static downloadPrompt() {
    const prompt = this.generateGeminiPrompt();
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gemini-prompt.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
