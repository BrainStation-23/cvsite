
import React from 'react';
import { CVSectionType } from '@/types/cv-templates';
import { SECTION_TYPES } from './sections/SectionConstants';
import AddSectionPanel from './sections/AddSectionPanel';
import SectionGroup from './sections/SectionGroup';
import { useTemplateSections } from '@/hooks/use-template-sections';
import { useSectionOperations } from '@/hooks/use-section-operations';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
} from '@dnd-kit/sortable';
import { sortableKeyboardCoordinates } from '@/hooks/sortable-keyboard-coordinates';

interface SectionManagerProps {
  templateId: string;
  onSectionsChange?: () => void;
  template?: any; // Template prop to access layout config
}

const SectionManager: React.FC<SectionManagerProps> = ({ 
  templateId, 
  onSectionsChange,
  template 
}) => {
  // Get layout type from template
  const layoutType = template?.layout_config?.layout || 'single-column';
  
  console.log('SectionManager render:', {
    templateId,
    layoutType,
    template: template?.layout_config
  });
  
  // Get default sidebar sections for sidebar layouts
  const getDefaultSidebarSections = (): CVSectionType[] => {
    if (layoutType === 'sidebar') {
      return template?.layout_config?.sidebarSections || ['technical_skills', 'specialized_skills'];
    }
    return [];
  };

  const defaultSidebarSections = getDefaultSidebarSections();

  const {
    sections,
    setSections,
    isLoading,
    expandedSections,
    isAddSectionOpen,
    setIsAddSectionOpen,
    toggleSectionExpanded,
    groupedSections,
    isMultiColumnLayout,
    loadSections
  } = useTemplateSections(templateId, layoutType, onSectionsChange, defaultSidebarSections);

  const {
    addSection,
    removeSection,
    updateSection,
    updateSectionStyling,
    updateFieldConfig,
    reorderFields,
    moveSectionToPlacement,
    updateSectionsOrder
  } = useSectionOperations(templateId, sections, setSections, onSectionsChange);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex(section => section.id === active.id);
      const newIndex = sections.findIndex(section => section.id === over?.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      
      newSections.forEach((section, idx) => {
        section.display_order = idx + 1;
      });

      setSections(newSections);
      await updateSectionsOrder(newSections);
    }
  };

  const getSectionLabel = (type: CVSectionType) => {
    return SECTION_TYPES.find(s => s.value === type)?.label || type;
  };

  const getAvailableSectionTypes = () => {
    const usedTypes = sections.map(s => s.section_type);
    return SECTION_TYPES.filter(type => 
      type.value === 'page_break' || !usedTypes.includes(type.value)
    );
  };

  const handleAddSection = async (sectionType: CVSectionType) => {
    await addSection(sectionType, isMultiColumnLayout, defaultSidebarSections);
    setIsAddSectionOpen(false);
  };

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading sections...</div>;
  }

  const availableSections = getAvailableSectionTypes();
  const { main: mainSections = [], sidebar: sidebarSections = [], all: allSections = [] } = groupedSections();

  console.log('Rendering sections:', {
    isMultiColumnLayout,
    mainSectionsCount: mainSections.length,
    sidebarSectionsCount: sidebarSections.length,
    allSectionsCount: allSections.length
  });

  return (
    <div className="space-y-4">
      <AddSectionPanel
        isOpen={isAddSectionOpen}
        onOpenChange={setIsAddSectionOpen}
        availableSectionTypes={availableSections}
        onAddSection={handleAddSection}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {isMultiColumnLayout ? (
          <div className="space-y-6">
            <SectionGroup
              groupSections={mainSections}
              groupName="Main Column"
              expandedSections={expandedSections}
              onToggleExpanded={toggleSectionExpanded}
              onUpdateSection={updateSection}
              onUpdateSectionStyling={updateSectionStyling}
              onUpdateFieldConfig={updateFieldConfig}
              onReorderFields={reorderFields}
              onRemoveSection={removeSection}
              onMoveSectionToPlacement={moveSectionToPlacement}
              getSectionLabel={getSectionLabel}
              layoutType={layoutType}
            />
            
            <SectionGroup
              groupSections={sidebarSections}
              groupName={layoutType.includes('sidebar') ? 'Sidebar' : 'Second Column'}
              expandedSections={expandedSections}
              onToggleExpanded={toggleSectionExpanded}
              onUpdateSection={updateSection}
              onUpdateSectionStyling={updateSectionStyling}
              onUpdateFieldConfig={updateFieldConfig}
              onReorderFields={reorderFields}
              onRemoveSection={removeSection}
              onMoveSectionToPlacement={moveSectionToPlacement}
              getSectionLabel={getSectionLabel}
              layoutType={layoutType}
            />
          </div>
        ) : (
          <SectionGroup
            groupSections={allSections}
            expandedSections={expandedSections}
            onToggleExpanded={toggleSectionExpanded}
            onUpdateSection={updateSection}
            onUpdateSectionStyling={updateSectionStyling}
            onUpdateFieldConfig={updateFieldConfig}
            onReorderFields={reorderFields}
            onRemoveSection={removeSection}
            onMoveSectionToPlacement={undefined}
            getSectionLabel={getSectionLabel}
            layoutType={layoutType}
          />
        )}
      </DndContext>

      {sections.length === 0 && availableSections.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">All available sections have been added to your template.</p>
        </div>
      )}

      {sections.length === 0 && availableSections.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No sections added yet. Use the "Add Section" button above to add sections to your template.</p>
        </div>
      )}
    </div>
  );
};

export default SectionManager;
