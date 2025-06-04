
export class MarkdownUtils {
  static getSectionTitle(sectionType: string): string {
    const titles: Record<string, string> = {
      technical_skills: 'Technical Skills',
      specialized_skills: 'Specialized Skills',
      experience: 'Professional Experience',
      education: 'Education',
      projects: 'Projects',
      trainings: 'Training & Certifications',
      achievements: 'Achievements & Awards'
    };
    return titles[sectionType] || this.formatSectionTitle(sectionType);
  }

  static getSectionIcon(sectionType: string): string {
    const icons: Record<string, string> = {
      technical_skills: '⚙️',
      specialized_skills: '🎯',
      experience: '💼',
      education: '🎓',
      projects: '🚀',
      trainings: '📜',
      achievements: '🏆'
    };
    return icons[sectionType] || '📋';
  }

  static getSectionData(profile: any, sectionType: string): any[] {
    switch (sectionType) {
      case 'technical_skills':
        return profile.technical_skills || [];
      case 'specialized_skills':
        return profile.specialized_skills || [];
      case 'experience':
        return profile.experiences || [];
      case 'education':
        return profile.education || [];
      case 'projects':
        return profile.projects || [];
      case 'trainings':
        return profile.trainings || [];
      case 'achievements':
        return profile.achievements || [];
      default:
        return [];
    }
  }

  static formatSectionTitle(sectionType: string): string {
    return sectionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
