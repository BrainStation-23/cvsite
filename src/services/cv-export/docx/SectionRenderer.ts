
import { Paragraph, Table } from 'docx';
import { DocumentStyler } from './DocumentStyler';
import { FieldMaskingService } from './FieldMaskingService';
import { FieldVisibilityService } from './FieldVisibilityService';
import { GeneralSectionRenderer } from './sections/GeneralSectionRenderer';
import { ExperienceSectionRenderer } from './sections/ExperienceSectionRenderer';
import { EducationSectionRenderer } from './sections/EducationSectionRenderer';
import { ProjectsSectionRenderer } from './sections/ProjectsSectionRenderer';
import { SkillsSectionRenderer } from './sections/SkillsSectionRenderer';
import { TrainingSectionRenderer } from './sections/TrainingSectionRenderer';
import { AchievementsSectionRenderer } from './sections/AchievementsSectionRenderer';

export class SectionRenderer {
  private styler!: DocumentStyler;
  private maskingService!: FieldMaskingService;
  private visibilityService!: FieldVisibilityService;
  
  private generalRenderer: GeneralSectionRenderer;
  private experienceRenderer: ExperienceSectionRenderer;
  private educationRenderer: EducationSectionRenderer;
  private projectsRenderer: ProjectsSectionRenderer;
  private skillsRenderer: SkillsSectionRenderer;
  private trainingRenderer: TrainingSectionRenderer;
  private achievementsRenderer: AchievementsSectionRenderer;

  constructor() {
    this.generalRenderer = new GeneralSectionRenderer();
    this.experienceRenderer = new ExperienceSectionRenderer();
    this.educationRenderer = new EducationSectionRenderer();
    this.projectsRenderer = new ProjectsSectionRenderer();
    this.skillsRenderer = new SkillsSectionRenderer();
    this.trainingRenderer = new TrainingSectionRenderer();
    this.achievementsRenderer = new AchievementsSectionRenderer();
  }

  setStyler(styler: DocumentStyler): void {
    this.styler = styler;
    // Set styler for all section renderers
    this.generalRenderer.setStyler(styler);
    this.experienceRenderer.setStyler(styler);
    this.educationRenderer.setStyler(styler);
    this.projectsRenderer.setStyler(styler);
    this.skillsRenderer.setStyler(styler);
    this.trainingRenderer.setStyler(styler);
    this.achievementsRenderer.setStyler(styler);
  }

  setMaskingService(maskingService: FieldMaskingService): void {
    this.maskingService = maskingService;
    // Set masking service for all section renderers
    this.generalRenderer.setMaskingService(maskingService);
    this.experienceRenderer.setMaskingService(maskingService);
    this.educationRenderer.setMaskingService(maskingService);
    this.projectsRenderer.setMaskingService(maskingService);
    this.skillsRenderer.setMaskingService(maskingService);
    this.trainingRenderer.setMaskingService(maskingService);
    this.achievementsRenderer.setMaskingService(maskingService);
  }

  setVisibilityService(visibilityService: FieldVisibilityService): void {
    this.visibilityService = visibilityService;
    // Set visibility service for all section renderers
    this.generalRenderer.setVisibilityService(visibilityService);
    this.experienceRenderer.setVisibilityService(visibilityService);
    this.educationRenderer.setVisibilityService(visibilityService);
    this.projectsRenderer.setVisibilityService(visibilityService);
    this.skillsRenderer.setVisibilityService(visibilityService);
    this.trainingRenderer.setVisibilityService(visibilityService);
    this.achievementsRenderer.setVisibilityService(visibilityService);
  }

  async renderSection(
    section: any, 
    profile: any, 
    fieldMappings: any[], 
    styles: any
  ): Promise<(Paragraph | Table)[]> {
    const elements: (Paragraph | Table)[] = [];
    
    try {
      // Handle page break sections
      if (section.section_type === 'page_break') {
        console.log('Rendering page break section');
        elements.push(this.styler.createPageBreak());
        return elements;
      }

      const sectionTitle = this.maskingService.getSectionTitle(section);
      console.log(`Rendering section: ${section.section_type} with title: ${sectionTitle}`);

      // Skip section title for general section (personal info goes at top without header)
      if (section.section_type !== 'general') {
        elements.push(this.styler.createSectionTitle(sectionTitle, styles?.baseStyles));
      }

      // Render section content based on type
      switch (section.section_type) {
        case 'general':
          const generalElements = await this.generalRenderer.render(profile, styles);
          elements.push(...generalElements);
          break;
        case 'experience':
          const experienceElements = this.experienceRenderer.render(profile.experiences || [], styles);
          elements.push(...experienceElements);
          break;
        case 'education':
          const educationElements = this.educationRenderer.render(profile.education || [], styles);
          elements.push(...educationElements);
          break;
        case 'projects':
          const projectElements = this.projectsRenderer.render(profile.projects || [], styles);
          elements.push(...projectElements);
          break;
        case 'technical_skills':
          const techSkillsElements = this.skillsRenderer.render(profile.technical_skills || [], styles);
          elements.push(...techSkillsElements);
          break;
        case 'specialized_skills':
          const specSkillsElements = this.skillsRenderer.render(profile.specialized_skills || [], styles);
          elements.push(...specSkillsElements);
          break;
        case 'training':
          const trainingElements = this.trainingRenderer.render(profile.trainings || [], styles);
          elements.push(...trainingElements);
          break;
        case 'achievements':
          const achievementElements = this.achievementsRenderer.render(profile.achievements || [], styles);
          elements.push(...achievementElements);
          break;
        default:
          console.log(`Unknown section type: ${section.section_type}`);
      }

      console.log(`Section ${section.section_type} rendered with ${elements.length} elements`);
      return elements;
    } catch (error) {
      console.error(`Error rendering section ${section.section_type}:`, error);
      return elements;
    }
  }

  private getSectionData(profile: any, sectionType: string): any {
    switch (sectionType) {
      case 'general':
        return profile;
      case 'experience':
        return profile.experiences || [];
      case 'education':
        return profile.education || [];
      case 'projects':
        return profile.projects || [];
      case 'technical_skills':
        return profile.technical_skills || [];
      case 'specialized_skills':
        return profile.specialized_skills || [];
      case 'training':
        return profile.trainings || [];
      case 'achievements':
        return profile.achievements || [];
      default:
        return null;
    }
  }
}
