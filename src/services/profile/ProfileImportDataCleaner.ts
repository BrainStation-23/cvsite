
export class ProfileImportDataCleaner {
  static parseFlexibleDate(dateStr: string | undefined | null): { date: Date | undefined; isCurrent: boolean } {
    if (!dateStr || dateStr.trim() === '') {
      return { date: undefined, isCurrent: false };
    }

    const cleanStr = dateStr.trim().toLowerCase();
    
    // Check for current indicators
    const currentIndicators = ['continuing', 'current', 'present', 'now', 'ongoing'];
    const isCurrent = currentIndicators.some(indicator => cleanStr.includes(indicator));
    
    if (isCurrent) {
      return { date: undefined, isCurrent: true };
    }

    try {
      // Handle various date formats
      if (cleanStr.match(/^\d{4}$/)) {
        // Just year: "2024"
        return { date: new Date(`${cleanStr}-01-01`), isCurrent: false };
      }
      
      if (cleanStr.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}$/i)) {
        // "Jan 2024" format
        const [month, year] = cleanStr.split(/\s+/);
        const monthMap: Record<string, string> = {
          'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
          'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
          'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
        };
        const monthNum = monthMap[month.toLowerCase()];
        if (monthNum) {
          return { date: new Date(`${year}-${monthNum}-01`), isCurrent: false };
        }
      }

      // Try parsing as ISO date
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        return { date: parsedDate, isCurrent: false };
      }
    } catch (error) {
      console.warn(`Failed to parse date: ${dateStr}`, error);
    }

    return { date: undefined, isCurrent: false };
  }

  static cleanPersonalInfo(personalInfo: Record<string, unknown>): {
    firstName: string;
    lastName: string;
    biography: string | null;
    profileImage: string | null;
    current_designation: string | null;
  } {
    return {
      firstName: String(personalInfo.firstName ?? ''),
      lastName: String(personalInfo.lastName ?? ''),
      biography: (personalInfo.biography != null ? String(personalInfo.biography) : null),
      profileImage: (personalInfo.profileImage != null ? String(personalInfo.profileImage) : null),
      current_designation: (personalInfo.current_designation != null ? String(personalInfo.current_designation) : null)
    };
  }

  static cleanExperience(experience: Record<string, unknown>): {
    companyName: string;
    designation: string;
    description: string | null;
    startDate: Date | undefined;
    endDate: Date | undefined;
    isCurrent: boolean;
  } {
    const startDateResult = this.parseFlexibleDate(experience.startDate as string | undefined | null);
    const endDateResult = this.parseFlexibleDate(experience.endDate as string | undefined | null);
    
    // If endDate indicates current, override isCurrent
    const isCurrent = Boolean(experience.isCurrent) || endDateResult.isCurrent;

    return {
      companyName: String(experience.companyName ?? ''),
      designation: String(experience.designation ?? ''),
      description: experience.description != null ? String(experience.description) : null, // Allow null
      startDate: startDateResult.date,
      endDate: isCurrent ? undefined : endDateResult.date,
      isCurrent: isCurrent
    };
  }

  static cleanEducation(education: Record<string, unknown>): {
    university: string;
    degree: string | null;
    department: string | null;
    gpa: string | null;
    startDate: Date | undefined;
    endDate: Date | undefined;
    isCurrent: boolean;
  } {
    const startDateResult = this.parseFlexibleDate(education.startDate as string | undefined | null);
    const endDateResult = this.parseFlexibleDate(education.endDate as string | undefined | null);
    
    const isCurrent = Boolean(education.isCurrent) || endDateResult.isCurrent;

    return {
      university: String(education.university ?? ''),
      degree: education.degree != null ? String(education.degree) : null,
      department: education.department != null ? String(education.department) : null,
      gpa: education.gpa != null ? String(education.gpa) : null,
      startDate: startDateResult.date,
      endDate: isCurrent ? undefined : endDateResult.date,
      isCurrent: isCurrent
    };
  }

  static cleanTraining(training: Record<string, unknown>): {
    title: string;
    provider: string | null;
    description: string | null;
    date: Date;
    certificateUrl: string | null;
  } {
    const dateResult = this.parseFlexibleDate(training.date as string | undefined | null);

    return {
      title: String(training.title ?? ''),
      provider: training.provider != null ? String(training.provider) : null,
      description: training.description != null ? String(training.description) : null, // Allow null
      date: dateResult.date || new Date(), // Default to current date if invalid
      certificateUrl: training.certificateUrl != null ? String(training.certificateUrl) : null
    };
  }

  static cleanAchievement(achievement: Record<string, unknown>): {
    title: string;
    description: string | null;
    date: Date;
  } {
    const dateResult = this.parseFlexibleDate(achievement.date as string | undefined | null);

    return {
      title: String(achievement.title ?? ''),
      description: achievement.description != null ? String(achievement.description) : null, // Allow null
      date: dateResult.date || new Date() // Default to current date if invalid
    };
  }

  static cleanProject(project: Record<string, unknown>): {
    name: string;
    role: string | null;
    description: string;
    responsibility: string | null;
    startDate: Date | undefined;
    endDate: Date | undefined;
    isCurrent: boolean;
    technologiesUsed: string[];
    url: string | null;
  } {
    const startDateResult = this.parseFlexibleDate(project.startDate as string | undefined | null);
    const endDateResult = this.parseFlexibleDate(project.endDate as string | undefined | null);
    
    const isCurrent = Boolean(project.isCurrent) || endDateResult.isCurrent;

    return {
      name: String(project.name ?? ''),
      role: project.role != null ? String(project.role) : null,
      description: String(project.description ?? ''), // Required field
      responsibility: project.responsibility != null ? String(project.responsibility) : null,
      startDate: startDateResult.date,
      endDate: isCurrent ? undefined : endDateResult.date,
      isCurrent: isCurrent,
      technologiesUsed: Array.isArray(project.technologiesUsed) ? (project.technologiesUsed as unknown[]).map(String) : [],
      url: project.url != null ? String(project.url) : null
    };
  }

  static cleanSkill(skill: Record<string, unknown>): { name: string; proficiency: number } {
    const proficiency = typeof skill.proficiency === 'number' ? (skill.proficiency as number) : 1;
    return {
      name: String(skill.name ?? ''),
      proficiency: Math.max(1, Math.min(10, proficiency)) // Ensure proficiency is between 1-10
    };
  }
}
