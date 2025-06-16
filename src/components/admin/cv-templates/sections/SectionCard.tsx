
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { CVSectionType } from '@/types/cv-templates';
import SectionHeader from './SectionHeader';
import SectionLayoutControls from './SectionLayoutControls';
import SectionConfiguration from './SectionConfiguration';
import SectionFieldConfig from './SectionFieldConfig';

interface FieldConfig {
  field: string;
  label: string;
  enabled: boolean;
  masked: boolean;
  mask_value?: string;
  order: number;
}

interface SectionConfig {
  id: string;
  section_type: CVSectionType;
  display_order: number;
  is_required: boolean;
  field_mapping: Record<string, any>;
  styling_config: {
    display_style?: string;
    projects_to_view?: number;
    max_skills_count?: number;
    selected_references?: string[];
    fields?: FieldConfig[];
    layout_placement?: 'main' | 'sidebar';
  };
}

interface SectionCardProps {
  section: SectionConfig;
  isExpanded: boolean;
  layoutType: string;
  dragAttributes: any;
  dragListeners: any;
  onToggleExpanded: (id: string) => void;
  onUpdateSectionStyling: (id: string, styleUpdates: Partial<SectionConfig['styling_config']>) => void;
  onUpdateFieldConfig: (sectionId: string, fieldIndex: number, fieldUpdates: Partial<FieldConfig>) => void;
  onReorderFields: (sectionId: string, reorderedFields: FieldConfig[]) => void;
  onRemoveSection: (id: string) => void;
  onMoveSectionToPlacement?: (sectionId: string, placement: 'main' | 'sidebar') => void;
  getSectionLabel: (type: CVSectionType) => string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  isExpanded,
  layoutType,
  dragAttributes,
  dragListeners,
  onToggleExpanded,
  onUpdateSectionStyling,
  onUpdateFieldConfig,
  onReorderFields,
  onRemoveSection,
  onMoveSectionToPlacement,
  getSectionLabel
}) => {
  const isPageBreak = section.section_type === 'page_break';
  const isMultiColumnLayout = ['two-column', 'sidebar'].includes(layoutType);

  console.log('SectionCard render:', {
    sectionId: section.id,
    layoutType,
    isMultiColumnLayout,
    hasMoveSectionToPlacement: !!onMoveSectionToPlacement,
    currentPlacement: section.styling_config.layout_placement,
    isExpanded,
    maxSkillsCount: section.styling_config.max_skills_count,
    selectedReferences: section.styling_config.selected_references
  });

  const getSectionColor = (sectionType: CVSectionType): string => {
    switch (sectionType) {
      case 'general':
        return 'border-l-blue-500 bg-blue-50';
      case 'experience':
        return 'border-l-green-500 bg-green-50';
      case 'education':
        return 'border-l-purple-500 bg-purple-50';
      case 'technical_skills':
        return 'border-l-orange-500 bg-orange-50';
      case 'specialized_skills':
        return 'border-l-pink-500 bg-pink-50';
      case 'projects':
        return 'border-l-teal-500 bg-teal-50';
      case 'training':
        return 'border-l-indigo-500 bg-indigo-50';
      case 'achievements':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'references':
        return 'border-l-cyan-500 bg-cyan-50';
      case 'page_break':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <Card className={`border-l-4 ${getSectionColor(section.section_type)}`}>
      <CardContent className="p-3">
        <SectionHeader
          section={section}
          isExpanded={isExpanded}
          isPageBreak={isPageBreak}
          layoutType={layoutType}
          getSectionLabel={getSectionLabel}
          onToggleExpanded={onToggleExpanded}
          onRemoveSection={onRemoveSection}
          dragAttributes={dragAttributes}
          dragListeners={dragListeners}
        />

        {!isPageBreak && (
          <Collapsible open={isExpanded}>
            <CollapsibleContent>
              <div className="space-y-4 pt-3 border-t mt-3">
                {/* Layout Placement Control for Multi-Column Layouts */}
                {isMultiColumnLayout && onMoveSectionToPlacement && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <SectionLayoutControls
                      sectionId={section.id}
                      currentPlacement={section.styling_config.layout_placement || 'main'}
                      layoutType={layoutType}
                      onMoveSectionToPlacement={onMoveSectionToPlacement}
                    />
                  </div>
                )}

                {/* Section Configuration */}
                <SectionConfiguration
                  sectionId={section.id}
                  sectionType={section.section_type}
                  displayStyle={section.styling_config.display_style || 'default'}
                  projectsToView={section.styling_config.projects_to_view}
                  maxSkillsCount={section.styling_config.max_skills_count}
                  selectedReferences={section.styling_config.selected_references}
                  onUpdateSectionStyling={onUpdateSectionStyling}
                />

                {/* Field Configuration */}
                <SectionFieldConfig
                  fields={section.styling_config.fields || []}
                  onUpdateField={(fieldIndex, fieldUpdates) => onUpdateFieldConfig(section.id, fieldIndex, fieldUpdates)}
                  onReorderFields={(reorderedFields) => onReorderFields(section.id, reorderedFields)}
                  sectionType={section.section_type}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {isPageBreak && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500">
              Page break sections create a new page in exports. No configuration needed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
