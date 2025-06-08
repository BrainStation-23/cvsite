
import { SectionSplitter } from '@/utils/sectionSplitter';
import { LayoutStrategyFactory } from '@/components/admin/cv-templates/layout-strategies/LayoutStrategyFactory';
import { PageContent, TemplateSection, FieldMapping } from '@/components/admin/cv-templates/layout-strategies/LayoutStrategyInterface';
import { HTMLLayoutRenderer } from './HTMLLayoutRenderer';

export class HTMLPageDistributor {
  private layoutRenderer = new HTMLLayoutRenderer();

  distributePages(
    sections: TemplateSection[],
    fieldMappings: FieldMapping[],
    profile: any,
    layoutConfig: Record<string, any> = {},
    orientation: string = 'portrait'
  ): string[] {
    if (!profile || sections.length === 0) {
      return ['<div class="empty-page">No content to display</div>'];
    }

    const A4_CONTENT_HEIGHT = SectionSplitter.getContentHeight(orientation);
    const MAX_PAGES = 20;
    const layoutType = layoutConfig.layoutType || 'single-column';

    console.log('HTML Page Distributor processing sections:', {
      layoutType,
      sectionsWithPlacement: sections.map(s => ({
        id: s.id,
        type: s.section_type,
        placement: s.styling_config?.layout_placement || 'main'
      }))
    });

    // Use the same strategy as the preview
    const strategy = LayoutStrategyFactory.createStrategy(layoutType);
    const distributedPages = strategy.distribute(
      sections,
      fieldMappings,
      profile,
      A4_CONTENT_HEIGHT,
      MAX_PAGES,
      orientation
    );

    // Convert each page to HTML
    return distributedPages.map((pageContent, index) => {
      return this.generatePageHTML(
        pageContent,
        layoutType,
        index + 1,
        distributedPages.length
      );
    });
  }

  private generatePageHTML(
    pageContent: PageContent,
    layoutType: string,
    pageNumber: number,
    totalPages: number
  ): string {
    const sectionsHTML = this.layoutRenderer.generateLayoutHTML(
      pageContent.sections,
      [], // Field mappings are handled within sections
      {}, // Profile data is embedded in sections
      layoutType,
      pageContent.partialSections
    );

    return `<div class="cv-page" data-page="${pageNumber}">
      ${sectionsHTML}
      ${pageNumber < totalPages ? '<div class="page-break"></div>' : ''}
    </div>`;
  }
}
