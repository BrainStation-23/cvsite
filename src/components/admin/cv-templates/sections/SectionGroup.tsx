
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableSectionItem from './SortableSectionItem';
import { SectionConfig } from '@/hooks/use-template-sections';
import { CVSectionType } from '@/types/cv-templates';

interface SectionGroupProps {
  groupSections: SectionConfig[];
  groupName?: string;
  expandedSections: Set<string>;
  onToggleExpanded: (id: string) => void;
  onUpdateSection: (id: string, updates: Partial<SectionConfig>) => void;
  onUpdateSectionStyling: (id: string, styleUpdates: Partial<SectionConfig['styling_config']>) => void;
  onUpdateFieldConfig: (sectionId: string, fieldIndex: number, fieldUpdates: Partial<any>) => void;
  onReorderFields: (sectionId: string, reorderedFields: any[]) => void;
  onRemoveSection: (id: string) => void;
  onMoveSectionToPlacement?: (sectionId: string, placement: 'main' | 'sidebar') => void;
  getSectionLabel: (type: CVSectionType) => string;
  layoutType: string;
}

const SectionGroup: React.FC<SectionGroupProps> = ({
  groupSections,
  groupName,
  expandedSections,
  onToggleExpanded,
  onUpdateSection,
  onUpdateSectionStyling,
  onUpdateFieldConfig,
  onReorderFields,
  onRemoveSection,
  onMoveSectionToPlacement,
  getSectionLabel,
  layoutType
}) => {
  return (
    <SortableContext items={groupSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-3">
        {groupName && (
          <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 capitalize">{groupName}</h4>
            <span className="text-xs text-gray-500">{groupSections.length} sections</span>
          </div>
        )}
        {groupSections.map((section) => (
          <SortableSectionItem
            key={section.id}
            section={section}
            expandedSections={expandedSections}
            onToggleExpanded={onToggleExpanded}
            onUpdateSection={onUpdateSection}
            onUpdateSectionStyling={onUpdateSectionStyling}
            onUpdateFieldConfig={onUpdateFieldConfig}
            onReorderFields={onReorderFields}
            onRemoveSection={onRemoveSection}
            onMoveSectionToPlacement={onMoveSectionToPlacement}
            getSectionLabel={getSectionLabel}
            layoutType={layoutType}
          />
        ))}
      </div>
    </SortableContext>
  );
};

export default SectionGroup;
