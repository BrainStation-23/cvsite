
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';
import SectionControls from './SectionControls';
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
    fields?: FieldConfig[];
  };
}

interface SectionItemProps {
  section: SectionConfig;
  index: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateSection: (updates: Partial<SectionConfig>) => void;
  onRemoveSection: () => void;
  onMoveSection: (direction: 'up' | 'down') => void;
  getSectionLabel: (type: CVSectionType) => string;
}

// Define default fields for each section type
const getDefaultFields = (sectionType: string): FieldConfig[] => {
  switch (sectionType) {
    case 'general':
      return [
        { field: 'profile_image', label: 'Profile Image', enabled: true, masked: false, order: 1 },
        { field: 'first_name', label: 'First Name', enabled: true, masked: false, order: 2 },
        { field: 'last_name', label: 'Last Name', enabled: true, masked: false, order: 3 },
        { field: 'employee_id', label: 'Employee ID', enabled: true, masked: false, order: 4 },
        { field: 'biography', label: 'Biography', enabled: true, masked: false, order: 5 },
      ];
    case 'experience':
      return [
        { field: 'company_name', label: 'Company Name', enabled: true, masked: false, order: 1 },
        { field: 'designation', label: 'Designation', enabled: true, masked: false, order: 2 },
        { field: 'start_date', label: 'Start Date', enabled: true, masked: false, order: 3 },
        { field: 'end_date', label: 'End Date', enabled: true, masked: false, order: 4 },
        { field: 'description', label: 'Description', enabled: true, masked: false, order: 5 },
      ];
    default:
      return [];
  }
};

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  index,
  isExpanded,
  onToggleExpanded,
  onUpdateSection,
  onRemoveSection,
  onMoveSection,
  getSectionLabel
}) => {
  const updateSectionStyling = (styleUpdates: Partial<SectionConfig['styling_config']>) => {
    const updatedStylingConfig = {
      ...section.styling_config,
      ...styleUpdates
    };
    onUpdateSection({ styling_config: updatedStylingConfig });
  };

  const updateFieldConfig = (fieldIndex: number, fieldUpdates: Partial<FieldConfig>) => {
    // Initialize fields if they don't exist
    let currentFields = section.styling_config.fields || [];
    if (currentFields.length === 0) {
      currentFields = getDefaultFields(section.section_type);
    }
    
    const updatedFields = [...currentFields];
    updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], ...fieldUpdates };
    updateSectionStyling({ fields: updatedFields });
  };

  const reorderFields = (reorderedFields: FieldConfig[]) => {
    updateSectionStyling({ fields: reorderedFields });
  };

  // Get fields to display (use existing or default)
  const fieldsToDisplay = section.styling_config.fields?.length > 0 
    ? section.styling_config.fields 
    : getDefaultFields(section.section_type);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveSection('up')}
                disabled={index === 0}
                className="h-3 w-6 p-0 text-xs"
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveSection('down')}
                className="h-3 w-6 p-0 text-xs"
              >
                ↓
              </Button>
            </div>
            <div>
              <h4 className="font-medium text-sm">{getSectionLabel(section.section_type)}</h4>
              <p className="text-xs text-gray-500">Order: {section.display_order}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleExpanded}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRemoveSection}
              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <Collapsible open={isExpanded}>
          <CollapsibleContent>
            <div className="space-y-3 pt-2 border-t">
              <SectionControls
                displayStyle={section.styling_config.display_style || 'default'}
                projectsToView={section.styling_config.projects_to_view}
                onDisplayStyleChange={(value) => updateSectionStyling({ display_style: value })}
                onProjectsToViewChange={(value) => updateSectionStyling({ projects_to_view: value })}
                sectionType={section.section_type}
              />

              <SectionFieldConfig
                fields={fieldsToDisplay}
                onUpdateField={updateFieldConfig}
                onReorderFields={reorderFields}
                sectionType={section.section_type}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default SectionItem;
