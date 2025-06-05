
import React from 'react';
import { CVSectionType } from '@/types/cv-templates';
import SectionCard from './SectionCard';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    fields?: FieldConfig[];
    layout_placement?: 'main' | 'sidebar';
  };
}

interface SortableSectionItemProps {
  section: SectionConfig;
  expandedSections: Set<string>;
  onToggleExpanded: (id: string) => void;
  onUpdateSection: (id: string, updates: Partial<SectionConfig>) => void;
  onUpdateSectionStyling: (id: string, styleUpdates: Partial<SectionConfig['styling_config']>) => void;
  onUpdateFieldConfig: (sectionId: string, fieldIndex: number, fieldUpdates: Partial<FieldConfig>) => void;
  onReorderFields: (sectionId: string, reorderedFields: FieldConfig[]) => void;
  onRemoveSection: (id: string) => void;
  onMoveSectionToPlacement?: (sectionId: string, placement: 'main' | 'sidebar') => void;
  getSectionLabel: (type: CVSectionType) => string;
  layoutType?: string;
}

const SortableSectionItem: React.FC<SortableSectionItemProps> = ({
  section,
  expandedSections,
  onToggleExpanded,
  onUpdateSection,
  onUpdateSectionStyling,
  onUpdateFieldConfig,
  onReorderFields,
  onRemoveSection,
  onMoveSectionToPlacement,
  getSectionLabel,
  layoutType = 'single-column'
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionCard
        section={section}
        isExpanded={expandedSections.has(section.id)}
        layoutType={layoutType}
        dragAttributes={attributes}
        dragListeners={listeners}
        onToggleExpanded={onToggleExpanded}
        onUpdateSectionStyling={onUpdateSectionStyling}
        onUpdateFieldConfig={onUpdateFieldConfig}
        onReorderFields={onReorderFields}
        onRemoveSection={onRemoveSection}
        onMoveSectionToPlacement={onMoveSectionToPlacement}
        getSectionLabel={getSectionLabel}
      />
    </div>
  );
};

export default SortableSectionItem;
