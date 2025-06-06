
import { TemplateSection } from './LayoutStrategyInterface';

export class LayoutTypeDetector {
  static getLayoutType(mainSections: TemplateSection[], sidebarSections: TemplateSection[]): string {
    // Determine if this is more of a sidebar layout (skills-heavy) or two-column layout
    const skillsSections = ['technical_skills', 'specialized_skills'];
    const sidebarSkillsCount = sidebarSections.filter(s => skillsSections.includes(s.section_type)).length;
    
    return sidebarSkillsCount > 0 ? 'sidebar' : 'two-column';
  }

  static separateSectionsByPlacement(sections: TemplateSection[]): {
    mainSections: TemplateSection[];
    sidebarSections: TemplateSection[];
  } {
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);
    
    const mainSections = sortedSections.filter(s => 
      (s.styling_config?.layout_placement || 'main') === 'main'
    );
    const sidebarSections = sortedSections.filter(s => 
      (s.styling_config?.layout_placement || 'main') === 'sidebar'
    );

    return { mainSections, sidebarSections };
  }
}
