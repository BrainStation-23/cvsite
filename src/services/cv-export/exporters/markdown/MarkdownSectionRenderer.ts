
export class MarkdownSectionRenderer {
  static renderSkillsSection(skills: any[]): string {
    let content = '';
    
    skills.forEach(skill => {
      // Ensure proficiency is a valid number between 1 and 10
      const proficiency = Math.max(1, Math.min(10, parseInt(skill.proficiency) || 1));
      // Create visual representation with stars (scale to 5 stars but show actual number out of 10)
      const starCount = Math.round((proficiency / 10) * 5);
      const filledStars = '★'.repeat(starCount);
      const emptyStars = '☆'.repeat(5 - starCount);
      content += `- **${skill.name}** - ${filledStars}${emptyStars} (${proficiency}/10)\n`;
    });
    
    content += '\n';
    return content;
  }

  static renderExperienceSection(experiences: any[]): string {
    let content = '';
    
    experiences.forEach((exp, index) => {
      content += `### ${exp.designation || 'Position'} at ${exp.company_name || 'Company'}\n\n`;
      
      const startDate = exp.start_date ? new Date(exp.start_date).toLocaleDateString() : '';
      const endDate = exp.is_current ? 'Present' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString() : '');
      
      if (startDate || endDate) {
        content += `**Duration:** ${startDate} - ${endDate}\n\n`;
      }
      
      if (exp.description) {
        content += `${exp.description}\n\n`;
      }
      
      if (index < experiences.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  static renderEducationSection(education: any[]): string {
    let content = '';
    
    education.forEach((edu, index) => {
      content += `### ${edu.degree || 'Degree'}`;
      if (edu.department) {
        content += ` in ${edu.department}`;
      }
      content += '\n\n';
      
      if (edu.university) {
        content += `**Institution:** ${edu.university}\n\n`;
      }
      
      const startDate = edu.start_date ? new Date(edu.start_date).toLocaleDateString() : '';
      const endDate = edu.is_current ? 'Present' : (edu.end_date ? new Date(edu.end_date).toLocaleDateString() : '');
      
      if (startDate || endDate) {
        content += `**Duration:** ${startDate} - ${endDate}\n\n`;
      }
      
      if (edu.gpa) {
        content += `**GPA:** ${edu.gpa}\n\n`;
      }
      
      if (index < education.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  static renderProjectsSection(projects: any[]): string {
    let content = '';
    
    projects.forEach((project, index) => {
      content += `### ${project.name || 'Project'}\n\n`;
      
      if (project.role) {
        content += `**Role:** ${project.role}\n\n`;
      }
      
      const startDate = project.start_date ? new Date(project.start_date).toLocaleDateString() : '';
      const endDate = project.is_current ? 'Present' : (project.end_date ? new Date(project.end_date).toLocaleDateString() : '');
      
      if (startDate || endDate) {
        content += `**Duration:** ${startDate} - ${endDate}\n\n`;
      }
      
      if (project.description) {
        content += `**Description:** ${project.description}\n\n`;
      }
      
      if (project.technologies_used && project.technologies_used.length > 0) {
        const technologies = Array.isArray(project.technologies_used) 
          ? project.technologies_used.join(', ') 
          : project.technologies_used;
        content += `**Technologies:** ${technologies}\n\n`;
      }
      
      if (project.url) {
        content += `**Project URL:** [${project.url}](${project.url})\n\n`;
      }
      
      if (index < projects.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  static renderTrainingsSection(trainings: any[]): string {
    let content = '';
    
    trainings.forEach((training, index) => {
      content += `### ${training.title || 'Training'}\n\n`;
      
      if (training.provider) {
        content += `**Provider:** ${training.provider}\n\n`;
      }
      
      if (training.certification_date) {
        content += `**Date:** ${new Date(training.certification_date).toLocaleDateString()}\n\n`;
      }
      
      if (training.description) {
        content += `**Description:** ${training.description}\n\n`;
      }
      
      if (training.certificate_url) {
        content += `**Certificate:** [View Certificate](${training.certificate_url})\n\n`;
      }
      
      if (index < trainings.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  static renderAchievementsSection(achievements: any[]): string {
    let content = '';
    
    achievements.forEach((achievement, index) => {
      content += `### ${achievement.title || 'Achievement'}\n\n`;
      
      if (achievement.date) {
        content += `**Date:** ${new Date(achievement.date).toLocaleDateString()}\n\n`;
      }
      
      if (achievement.description) {
        content += `${achievement.description}\n\n`;
      }
      
      if (index < achievements.length - 1) {
        content += '---\n\n';
      }
    });
    
    return content;
  }

  static renderGenericSection(data: any[]): string {
    let content = '';
    
    data.forEach((item, index) => {
      content += `### Item ${index + 1}\n\n`;
      content += '```json\n';
      content += JSON.stringify(item, null, 2);
      content += '\n```\n\n';
    });
    
    return content;
  }
}
