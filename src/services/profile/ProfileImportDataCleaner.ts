
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

  static cleanPersonalInfo(personalInfo: any): any {
    return {
      firstName: personalInfo.firstName || '',
      lastName: personalInfo.lastName || '',
      biography: personalInfo.biography || null, // Allow null for optional field
      profileImage: personalInfo.profileImage || null, // Allow null for optional field
      current_designation: personalInfo.current_designation || null // Allow null for optional field
    };
  }

  static cleanExperience(experience: any): any {
    const startDateResult = this.parseFlexibleDate(experience.startDate);
    const endDateResult = this.parseFlexibleDate(experience.endDate);
    
    // If endDate indicates current, override isCurrent
    const isCurrent = experience.isCurrent || endDateResult.isCurrent;

    return {
      companyName: experience.companyName || '',
      designation: experience.designation || '',
      description: experience.description || null, // Allow null for optional field
      startDate: startDateResult.date,
      endDate: isCurrent ? undefined : endDateResult.date,
      isCurrent: isCurrent
    };
  }

  static cleanEducation(education: any): any {
    const startDateResult = this.parseFlexibleDate(education.startDate);
    const endDateResult = this.parseFlexibleDate(education.endDate);
    
    const isCurrent = education.isCurrent || endDateResult.isCurrent;

    return {
      university: education.university || '',
      degree: education.degree || null, // Allow null for optional field
      department: education.department || null, // Allow null for optional field
      gpa: education.gpa || null, // Allow null for optional field
      startDate: startDateResult.date,
      endDate: isCurrent ? undefined : endDateResult.date,
      isCurrent: isCurrent
    };
  }

  static cleanTraining(training: any): any {
    const dateResult = this.parseFlexibleDate(training.date);

    return {
      title: training.title || '',
      provider: training.provider || null, // Allow null for optional field
      description: training.description || null, // Allow null for optional field
      date: dateResult.date || new Date(), // Default to current date if invalid
      certificateUrl: training.certificateUrl || null // Allow null for optional field
    };
  }

  static cleanAchievement(achievement: any): any {
    const dateResult = this.parseFlexibleDate(achievement.date);

    return {
      title: achievement.title || '',
      description: achievement.description || '',
      date: dateResult.date || new Date() // Default to current date if invalid
    };
  }

  static cleanProject(project: any): any {
    const startDateResult = this.parseFlexibleDate(project.startDate);
    const endDateResult = this.parseFlexibleDate(project.endDate);
    
    const isCurrent = project.isCurrent || endDateResult.isCurrent;

    return {
      name: project.name || '',
      role: project.role || null, // Allow null for optional field
      description: project.description || '',
      responsibility: project.responsibility || null, // Allow null for optional field
      startDate: startDateResult.date,
      endDate: isCurrent ? undefined : endDateResult.date,
      isCurrent: isCurrent,
      technologiesUsed: Array.isArray(project.technologiesUsed) ? project.technologiesUsed : [],
      url: project.url || null // Allow null for optional field
    };
  }

  static cleanSkill(skill: any): any {
    const proficiency = typeof skill.proficiency === 'number' ? skill.proficiency : 1;
    return {
      name: skill.name || '',
      proficiency: Math.max(1, Math.min(10, proficiency)) // Ensure proficiency is between 1-10
    };
  }
}
