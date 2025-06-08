
import { HTMLFieldProcessor } from './HTMLFieldProcessor';
import { GeneralSectionRenderer } from './sections/GeneralSectionRenderer';
import { ExperienceSectionRenderer } from './sections/ExperienceSectionRenderer';
import { EducationSectionRenderer } from './sections/EducationSectionRenderer';
import { SkillsSectionRenderer } from './sections/SkillsSectionRenderer';
import { ProjectsSectionRenderer } from './sections/ProjectsSectionRenderer';
import { TrainingSectionRenderer } from './sections/TrainingSectionRenderer';
import { AchievementsSectionRenderer } from './sections/AchievementsSectionRenderer';

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
  private generalRenderer = new GeneralSectionRenderer(this.fieldProcessor);
  private experienceRenderer = new ExperienceSectionRenderer();
  private educationRenderer = new EducationSectionRenderer();
  private skillsRenderer = new SkillsSectionRenderer();
  private projectsRenderer = new ProjectsSectionRenderer();
  private trainingRenderer = new TrainingSectionRenderer();
  private achievementsRenderer = new AchievementsSectionRenderer();

  generateSectionsHTML(
    sections: TemplateSection[], 
    profile: any, 
    fieldMappings: FieldMapping[],
    partialSections: any = {}
  ): string {
    console.log('=== HTML SECTIONS GENERATOR DEBUG START ===');
    console.log('HTML Sections Generator - Input sections:', sections.length);
    console.log('HTML Sections Generator - Sections details:', sections.map(s => ({
      id: s.id,
      type: s.section_type,
      order: s.display_order
    })));
    console.log('HTML Sections Generator - Field mappings:', fieldMappings.length);
    console.log('HTML Sections Generator - Partial sections:', Object.keys(partialSections));
    console.log('HTML Sections Generator - Profile data structure check:', {
      hasProfile: !!profile,
      profileKeys: profile ? Object.keys(profile) : [],
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      technicalSkills: profile?.technical_skills,
      specializedSkills: profile?.specialized_skills,
      technicalSkillsArray: Array.isArray(profile?.technical_skills),
      specializedSkillsArray: Array.isArray(profile?.specialized_skills),
      experiences: profile?.experiences,
      experiencesArray: Array.isArray(profile?.experiences)
    });

    if (!sections || sections.length === 0) {
      console.log('HTML Sections Generator - No sections to generate');
      return '';
    }

    // Sort sections by display order
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    console.log('HTML Sections Generator - Sorted sections:', sortedSections.map(s => s.section_type));
    
    const renderedSections = sortedSections.map(section => {
      console.log(`HTML Sections Generator - Rendering section: ${section.section_type} (id: ${section.id})`);
      const html = this.renderSection(section, profile, fieldMappings, partialSections);
      console.log(`HTML Sections Generator - Section ${section.section_type} rendered, length:`, html.length);
      return html;
    }).filter(html => html.trim().length > 0);

    console.log('HTML Sections Generator - Final rendered sections count:', renderedSections.length);
    console.log('=== HTML SECTIONS GENERATOR DEBUG END ===');
    
    return renderedSections.join('\n');
  }

  private renderSection(
    section: TemplateSection, 
    profile: any, 
    fieldMappings: FieldMapping[],
    partialSections: any
  ): string {
    console.log(`HTML Sections Generator - Processing section: ${section.section_type}`);
    
    // Handle page break sections
    if (section.section_type === 'page_break') {
      console.log('HTML Sections Generator - Rendering page break');
      return '<div class="page-break"></div>';
    }

    // Get field mappings for this section
    const sectionFieldMappings = fieldMappings.filter(
      mapping => mapping.section_type === section.section_type
    );
    console.log(`HTML Sections Generator - Found ${sectionFieldMappings.length} field mappings for ${section.section_type}`);

    // Check if this section has partial data for this page
    const partialData = partialSections[section.id];
    if (partialData) {
      console.log(`HTML Sections Generator - Using partial data for ${section.section_type}:`, partialData);
    }
    
    // Create modified profile with partial data if applicable
    const profileForSection = partialData ? {
      ...profile,
      [this.getSectionDataKey(section.section_type)]: partialData.items
    } : profile;

    // Special handling for general section - data is directly on profile
    if (section.section_type === 'general') {
      console.log('HTML Sections Generator - General section - using profile data directly');
      console.log('HTML Sections Generator - General section profile data:', {
        firstName: profile?.first_name,
        lastName: profile?.last_name,
        email: profile?.email,
        phone: profile?.phone,
        location: profile?.location,
        designation: profile?.designation,
        biography: profile?.biography,
        profileImage: profile?.profile_image
      });
    } else {
      // Check if section has data for non-general sections
      const sectionDataKey = this.getSectionDataKey(section.section_type);
      const sectionData = profileForSection[sectionDataKey];
      console.log(`HTML Sections Generator - Section ${section.section_type} data check:`, {
        dataKey: sectionDataKey,
        hasData: !!sectionData,
        dataLength: Array.isArray(sectionData) ? sectionData.length : 'not array',
        dataType: typeof sectionData,
        actualData: sectionData
      });
    }

    // Generate section HTML based on type
    let html = '';
    switch (section.section_type) {
      case 'general':
        console.log('HTML Sections Generator - Rendering general section');
        html = this.generalRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
        break;
      case 'experience':
        console.log('HTML Sections Generator - Rendering experience section');
        html = this.experienceRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
        break;
      case 'education':
        console.log('HTML Sections Generator - Rendering education section');
        html = this.educationRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
        break;
      case 'technical_skills':
        console.log('HTML Sections Generator - Rendering technical skills section');
        html = this.skillsRenderer.renderTechnicalSkills(profileForSection, sectionFieldMappings, section, partialData?.title);
        break;
      case 'specialized_skills':
        console.log('HTML Sections Generator - Rendering specialized skills section');
        html = this.skillsRenderer.renderSpecializedSkills(profileForSection, sectionFieldMappings, section, partialData?.title);
        break;
      case 'projects':
        console.log('HTML Sections Generator - Rendering projects section');
        html = this.projectsRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
        break;
      case 'training':
        console.log('HTML Sections Generator - Rendering training section');
        html = this.trainingRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
        break;
      case 'achievements':
        console.log('HTML Sections Generator - Rendering achievements section');
        html = this.achievementsRenderer.render(profileForSection, sectionFieldMappings, section, partialData?.title);
        break;
      default:
        console.warn(`HTML Sections Generator - Unknown section type: ${section.section_type}`);
        html = `<div class="unknown-section">Unknown section type: ${section.section_type}</div>`;
    }

    console.log(`HTML Sections Generator - Rendered ${section.section_type}, HTML length:`, html.length);
    return html;
  }

  private getSectionDataKey(sectionType: string): string {
    switch (sectionType) {
      case 'general':
        // General section data is directly on the profile object, not nested
        return 'general'; // This will be handled specially in the renderer
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
