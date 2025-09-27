
import { ProfileImportDataCleaner } from './ProfileImportDataCleaner';
import { ProfileJSONData, ProfileJSONService } from './ProfileJSONService';

export class AIProfileImportDataCleaner extends ProfileImportDataCleaner {
  // Handle AI-specific data cleaning and validation
  static cleanAIExtractedData(data: ProfileJSONData): ProfileJSONData {
    // First apply standard cleaning using the canonical cleaner
    const cleaned = ProfileJSONService.cleanImportData(data);

    // Apply AI-specific fixes
    cleaned.technicalSkills = this.cleanAISkills(cleaned.technicalSkills, 'technical');
    cleaned.specializedSkills = this.cleanAISkills(cleaned.specializedSkills, 'specialized');
    cleaned.experiences = this.cleanAIExperiences(cleaned.experiences);
    cleaned.education = this.cleanAIEducation(cleaned.education);
    cleaned.projects = this.cleanAIProjects(cleaned.projects);

    return cleaned;
  }

  // Note: general import cleaning is handled by ProfileJSONService.cleanImportData

  private static cleanAISkills(
    skills: Array<{ name: string; proficiency: number }>,
    type: 'technical' | 'specialized'
  ): Array<{ name: string; proficiency: number }> {
    if (!Array.isArray(skills)) return [];
    
    return skills.map(skill => ({
      ...skill,
      // Ensure proficiency is set to 1 if missing or invalid
      proficiency: typeof skill.proficiency === 'number' && skill.proficiency >= 1 && skill.proficiency <= 10 
        ? skill.proficiency 
        : 1,
      // Clean skill names
      name: this.cleanSkillName(skill.name),
    })).filter(skill => skill.name && skill.name.trim().length > 0);
  }

  private static cleanSkillName(name: string): string {
    if (!name) return '';
    
    // Clean common AI extraction issues
    return name
      .trim()
      .replace(/[^\w\s.+#-]/g, '') // Remove special chars except common programming ones
      .replace(/\s+/g, ' ') // Normalize spaces
      .substring(0, 50); // Limit length
  }

  private static cleanAIExperiences(
    experiences: ProfileJSONData['experiences']
  ): ProfileJSONData['experiences'] {
    if (!Array.isArray(experiences)) return [];
    
    return experiences
      .map(exp => ({
        ...exp,
        companyName: this.cleanCompanyName(exp.companyName),
        designation: this.cleanDesignation(exp.designation),
        description: this.cleanDescription(exp.description ?? ''),
      }))
      .filter(exp => exp.companyName && exp.companyName.trim().length > 0);
  }

  private static cleanCompanyName(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .replace(/^(at\s+|@\s+)/i, '') // Remove "at" or "@" prefixes
      .replace(/\s+/g, ' ')
      .substring(0, 100);
  }

  private static cleanDesignation(designation: string): string {
    if (!designation) return '';
    
    return designation
      .trim()
      .replace(/^(as\s+|role:\s*)/i, '') // Remove "as" or "role:" prefixes
      .replace(/\s+/g, ' ')
      .substring(0, 100);
  }

  private static cleanDescription(description: string): string {
    if (!description) return '';
    
    return description
      .trim()
      .substring(0, 2000); // Limit description length
  }

  private static cleanAIEducation(
    education: ProfileJSONData['education']
  ): ProfileJSONData['education'] {
    if (!Array.isArray(education)) return [];
    
    return education.map(edu => ({
      ...edu,
      // Additional AI-specific cleaning for education
      university: this.cleanUniversityName(edu.university),
      degree: this.cleanDegreeName(edu.degree as string | undefined || ''),
      department: this.cleanDepartmentName(edu.department as string | undefined || ''),
    })).filter(edu => edu.university && edu.university.trim().length > 0);
  }

  private static cleanUniversityName(name: string): string {
    if (!name) return '';
    
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 200);
  }

  private static cleanDegreeName(name: string): string {
    if (!name) return '';
    
    // Common degree name mappings from AI extraction
    const degreeMap: Record<string, string> = {
      'bachelor of science': 'BSc',
      'bachelor of arts': 'BA',
      'bachelor of business administration': 'BBA',
      'bachelor of technology': 'BTech',
      'master of science': 'MSc',
      'master of business administration': 'MBA',
      'master of technology': 'MTech',
      'doctor of philosophy': 'PhD',
    };

    const normalized = name.toLowerCase().trim();
    const mapped = degreeMap[normalized];
    
    return mapped || name.trim().substring(0, 50);
  }

  private static cleanDepartmentName(name: string): string {
    if (!name) return '';
    
    // Common department name mappings
    const deptMap: Record<string, string> = {
      'computer science and engineering': 'CSE',
      'computer science': 'CS',
      'electrical and electronics engineering': 'EEE',
      'mechanical engineering': 'ME',
      'business administration': 'BBA',
      'marketing': 'MKT',
    };

    const normalized = name.toLowerCase().trim();
    const mapped = deptMap[normalized];
    
    return mapped || name.trim().substring(0, 100);
  }

  private static cleanAIProjects(
    projects: ProfileJSONData['projects']
  ): ProfileJSONData['projects'] {
    if (!Array.isArray(projects)) return [];
    
    return projects.map(project => ({
      ...project,
      // Clean technologies used array
      technologiesUsed: this.cleanTechnologiesArray(project.technologiesUsed),
      // Clean project name and description
      name: this.cleanProjectName(project.name),
      description: this.cleanDescription(project.description),
    })).filter(project => project.name && project.name.trim().length > 0);
  }

  private static cleanProjectName(name: string): string {
    if (!name) return '';
    
    return name
      .trim()
      .substring(0, 100);
  }

  private static cleanTechnologiesArray(technologies: unknown): string[] {
    if (!Array.isArray(technologies)) return [];
    
    return technologies
      .map(tech => typeof tech === 'string' ? tech.trim() : String(tech).trim())
      .filter(tech => tech.length > 0 && tech.length < 50)
      .slice(0, 20); // Limit to 20 technologies
  }

  // Validate extracted data against database constraints
  static async validateWithDatabase(
    data: ProfileJSONData,
    databases: {
      universities: string[];
      degrees: string[];
      departments: string[];
      designations: string[];
    }
  ): Promise<ProfileJSONData> {
    const validated: ProfileJSONData = { ...data } as ProfileJSONData;

    // Filter education by valid universities
    validated.education = validated.education.filter((edu) => {
      const universityMatch = databases.universities.some(uni => 
        uni.toLowerCase().includes(edu.university.toLowerCase()) ||
        edu.university.toLowerCase().includes(uni.toLowerCase())
      );
      
      if (!universityMatch) {
        console.warn(`University not found in database: ${edu.university}`);
      }
      
      return universityMatch;
    });

    // Validate and map degrees
    validated.education = validated.education.map((edu) => ({
      ...edu,
      degree: this.findBestMatch(edu.degree ?? '', databases.degrees) || edu.degree
    }));

    // Validate and map departments
    validated.education = validated.education.map((edu) => ({
      ...edu,
      department: this.findBestMatch(edu.department ?? '', databases.departments) || edu.department
    }));

    // Validate and map designations
    validated.experiences = validated.experiences.map((exp) => ({
      ...exp,
      designation: this.findBestMatch(exp.designation, databases.designations) || exp.designation
    }));

    return validated;
  }

  private static findBestMatch(input: string, options: string[]): string | null {
    if (!input) return null;
    
    const inputLower = input.toLowerCase();
    
    // Exact match
    const exactMatch = options.find(opt => opt.toLowerCase() === inputLower);
    if (exactMatch) return exactMatch;
    
    // Partial match
    const partialMatch = options.find(opt => 
      opt.toLowerCase().includes(inputLower) || inputLower.includes(opt.toLowerCase())
    );
    
    return partialMatch || null;
  }
}
