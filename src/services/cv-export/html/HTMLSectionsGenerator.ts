import { HTMLFieldProcessor } from './HTMLFieldProcessor';

interface TemplateSection {
  id: string;
  section_type: string;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: Record<string, any>;
}

interface FieldMapping {
  original_field_name: string;
  display_name: string;
  is_masked: boolean;
  mask_value?: string;
  field_order: number;
  visibility_rules: Record<string, any>;
  section_type: string;
}

export class HTMLSectionsGenerator {
  private fieldProcessor = new HTMLFieldProcessor();

  generateSectionsHTML(
    sections: TemplateSection[], 
    profile: any, 
    fieldMappings: FieldMapping[],
    partialSections: any = {}
  ): string {
    if (!sections || sections.length === 0) {
      return '';
    }

    // Sort sections by display order
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    
    return sortedSections.map(section => this.renderSection(section, profile, fieldMappings, partialSections)).join('\n');
  }

  private renderSection(
    section: TemplateSection, 
    profile: any, 
    fieldMappings: FieldMapping[],
    partialSections: any
  ): string {
    // Handle page break sections
    if (section.section_type === 'page_break') {
      return '<div class="page-break"></div>';
    }

    // Get field mappings for this section
    const sectionFieldMappings = fieldMappings.filter(
      mapping => mapping.section_type === section.section_type
    );

    // Check if this section has partial data for this page
    const partialData = partialSections[section.id];
    
    // Create modified profile with partial data if applicable
    const profileForSection = partialData ? {
      ...profile,
      [this.getSectionDataKey(section.section_type)]: partialData.items
    } : profile;

    // Generate section HTML based on type
    switch (section.section_type) {
      case 'general':
        return this.renderGeneralSection(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'experience':
        return this.renderExperienceSection(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'education':
        return this.renderEducationSection(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'technical_skills':
        return this.renderTechnicalSkillsSection(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'specialized_skills':
        return this.renderSpecializedSkillsSection(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'projects':
        return this.renderProjectsSection(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'training':
        return this.renderTrainingSection(profileForSection, sectionFieldMappings, section, partialData?.title);
      case 'achievements':
        return this.renderAchievementsSection(profileForSection, sectionFieldMappings, section, partialData?.title);
      default:
        console.warn(`Unknown section type: ${section.section_type}`);
        return `<div class="unknown-section">Unknown section type: ${section.section_type}</div>`;
    }
  }

  private renderGeneralSection(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Personal Information';
    
    // Check if profile image should be shown
    const hasProfileImage = profile.profile_image;
    
    // Get orientation from styling config or default to portrait
    const orientation = section.styling_config?.orientation || 'portrait';
    const isLandscape = orientation === 'landscape';
    const imageSize = isLandscape ? '60px' : '80px';
    
    const profileImageHTML = hasProfileImage ? `
      <div style="margin-bottom: 10pt; text-align: center;">
        <img 
          src="${profile.profile_image}" 
          alt="Profile" 
          style="
            width: ${imageSize}; 
            height: ${imageSize}; 
            border-radius: 4px; 
            object-fit: cover;
            border: 1px solid #e5e7eb;
          " 
        />
      </div>
    ` : '';
    
    return `<div class="section general-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${profileImageHTML}
        ${this.fieldProcessor.processField('first_name', profile.first_name, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('last_name', profile.last_name, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('email', profile.email, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('phone', profile.phone, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('location', profile.location, fieldMappings, 'general')}
        ${this.fieldProcessor.processField('designation', profile.designation, fieldMappings, 'general')}
        ${profile.biography ? `<p style="margin-top: 10pt; font-size: 0.9em; font-style: italic;">${profile.biography}</p>` : ''}
      </div>
    </div>`;
  }

  private renderExperienceSection(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Professional Experience';
    const experiences = profile.experiences || [];
    
    const experienceItems = experiences.map((exp: any) => `
      <div class="item experience-item">
        <div class="item-header">
          <h4 class="item-title">${exp.job_title || ''}</h4>
          <div class="item-subtitle">${exp.company_name || ''} | ${exp.start_date || ''} - ${exp.end_date || 'Present'}</div>
        </div>
        ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
      </div>
    `).join('');

    return `<div class="section experience-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${experienceItems}
      </div>
    </div>`;
  }

  private renderEducationSection(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Education';
    const education = profile.education || [];
    
    const educationItems = education.map((edu: any) => `
      <div class="item education-item">
        <div class="item-header">
          <h4 class="item-title">${edu.degree || ''}</h4>
          <div class="item-subtitle">${edu.university || ''} | ${edu.graduation_year || ''}</div>
        </div>
        ${edu.department ? `<div class="item-detail">Department: ${edu.department}</div>` : ''}
        ${edu.gpa ? `<div class="item-detail">GPA: ${edu.gpa}</div>` : ''}
      </div>
    `).join('');

    return `<div class="section education-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${educationItems}
      </div>
    </div>`;
  }

  private renderTechnicalSkillsSection(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Technical Skills';
    const skills = profile.technical_skills || [];
    
    const skillsHTML = skills.map((skill: any) => {
      const technologies = Array.isArray(skill.technologies) ? skill.technologies : [];
      const techItems = technologies.map((tech: string) => `<span class="skill-tag">${tech}</span>`).join('');
      
      return `<div class="skill-category">
        <h4 class="skill-category-title">${skill.category || ''}</h4>
        <div class="skills-container">${techItems}</div>
      </div>`;
    }).join('');

    return `<div class="section technical-skills-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${skillsHTML}
      </div>
    </div>`;
  }

  private renderSpecializedSkillsSection(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Specialized Skills';
    const skills = profile.specialized_skills || [];
    
    const skillsHTML = skills.map((skill: any) => {
      const technologies = Array.isArray(skill.technologies) ? skill.technologies : [];
      const techItems = technologies.map((tech: string) => `<span class="skill-tag">${tech}</span>`).join('');
      
      return `<div class="skill-category">
        <h4 class="skill-category-title">${skill.category || ''}</h4>
        <div class="skills-container">${techItems}</div>
      </div>`;
    }).join('');

    return `<div class="section specialized-skills-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${skillsHTML}
      </div>
    </div>`;
  }

  private renderProjectsSection(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Projects';
    const projects = profile.projects || [];
    
    const projectItems = projects.map((project: any) => {
      const technologies = Array.isArray(project.technologies_used) ? project.technologies_used : [];
      const techTags = technologies.map((tech: string) => `<span class="skill-tag">${tech}</span>`).join('');
      
      return `<div class="item project-item">
        <div class="item-header">
          <h4 class="item-title">${project.name || ''}</h4>
          <div class="item-subtitle">${project.role || ''} | ${project.start_date || ''} - ${project.end_date || 'Present'}</div>
        </div>
        ${project.description ? `<div class="item-description">${project.description}</div>` : ''}
        ${technologies.length > 0 ? `<div class="technologies">${techTags}</div>` : ''}
        ${project.url ? `<div class="project-url"><a href="${project.url}" target="_blank">${project.url}</a></div>` : ''}
      </div>`;
    }).join('');

    return `<div class="section projects-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${projectItems}
      </div>
    </div>`;
  }

  private renderTrainingSection(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Training & Certifications';
    const trainings = profile.trainings || [];
    
    const trainingItems = trainings.map((training: any) => `
      <div class="item training-item">
        <div class="item-header">
          <h4 class="item-title">${training.name || ''}</h4>
          <div class="item-subtitle">${training.provider || ''} | ${training.completion_date || ''}</div>
        </div>
        ${training.description ? `<div class="item-description">${training.description}</div>` : ''}
      </div>
    `).join('');

    return `<div class="section training-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${trainingItems}
      </div>
    </div>`;
  }

  private renderAchievementsSection(profile: any, fieldMappings: FieldMapping[], section: TemplateSection, customTitle?: string): string {
    const title = customTitle || 'Achievements';
    const achievements = profile.achievements || [];
    
    const achievementItems = achievements.map((achievement: any) => `
      <div class="item achievement-item">
        <div class="item-header">
          <h4 class="item-title">${achievement.title || ''}</h4>
          <div class="item-subtitle">${achievement.date || ''}</div>
        </div>
        ${achievement.description ? `<div class="item-description">${achievement.description}</div>` : ''}
      </div>
    `).join('');

    return `<div class="section achievements-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        ${achievementItems}
      </div>
    </div>`;
  }

  private getSectionDataKey(sectionType: string): string {
    switch (sectionType) {
      case 'experience':
        return 'experiences';
      case 'education':
        return 'education';
      case 'projects':
        return 'projects';
      case 'technical_skills':
        return 'technical_skills';
      case 'specialized_skills':
        return 'specialized_skills';
      case 'training':
        return 'trainings';
      case 'achievements':
        return 'achievements';
      default:
        return sectionType;
    }
  }
}
