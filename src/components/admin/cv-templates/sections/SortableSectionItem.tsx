import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';
import SectionFieldConfig from './SectionFieldConfig';
import { DISPLAY_STYLES, SECTION_TYPES } from './SectionConstants';
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

  const isPageBreak = section.section_type === 'page_break';
  const showProjectsToView = section.section_type === 'projects';
  const isMultiColumnLayout = ['two-column', 'sidebar-left', 'sidebar-right'].includes(layoutType);

  // Get section type configuration for icon and color
  const sectionTypeConfig = SECTION_TYPES.find(type => type.value === section.section_type);
  const Icon = sectionTypeConfig?.icon;
  
  // Define color mapping for each section type
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
      case 'page_break':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getIconColor = (sectionType: CVSectionType): string => {
    switch (sectionType) {
      case 'general':
        return 'text-blue-600';
      case 'experience':
        return 'text-green-600';
      case 'education':
        return 'text-purple-600';
      case 'technical_skills':
        return 'text-orange-600';
      case 'specialized_skills':
        return 'text-pink-600';
      case 'projects':
        return 'text-teal-600';
      case 'training':
        return 'text-indigo-600';
      case 'achievements':
        return 'text-yellow-600';
      case 'page_break':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`border-l-4 ${getSectionColor(section.section_type)}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              
              {Icon && (
                <div className={`p-2 rounded-md ${getSectionColor(section.section_type).replace('border-l-', 'bg-').replace('-500', '-100')}`}>
                  <Icon className={`h-4 w-4 ${getIconColor(section.section_type)}`} />
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-sm">{getSectionLabel(section.section_type)}</h4>
                <p className="text-xs text-gray-500">{sectionTypeConfig?.description}</p>
                {isMultiColumnLayout && !isPageBreak && (
                  <p className="text-xs text-blue-600 font-medium">
                    {section.styling_config.layout_placement === 'sidebar' 
                      ? (layoutType.includes('sidebar') ? 'Sidebar' : 'Second Column')
                      : 'Main Column'
                    }
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isPageBreak && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onToggleExpanded(section.id)}
                  className="h-6 w-6 p-0"
                >
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveSection(section.id)}
                className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isPageBreak && (
            <Collapsible open={expandedSections.has(section.id)}>
              <CollapsibleContent>
                <div className="space-y-3 pt-2 border-t">
                  {/* Layout Placement Control for Multi-Column Layouts */}
                  {isMultiColumnLayout && onMoveSectionToPlacement && (
                    <div>
                      <Label className="text-xs">Column Placement</Label>
                      <Select 
                        value={section.styling_config.layout_placement || 'main'} 
                        onValueChange={(value: 'main' | 'sidebar') => onMoveSectionToPlacement(section.id, value)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">Main Column</SelectItem>
                          <SelectItem value="sidebar">
                            {layoutType.includes('sidebar') ? 'Sidebar' : 'Second Column'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Section Configuration */}
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <Label className="text-xs">Display Style</Label>
                      <Select 
                        value={section.styling_config.display_style || 'default'} 
                        onValueChange={(value) => onUpdateSectionStyling(section.id, { display_style: value })}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DISPLAY_STYLES.map(style => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {showProjectsToView && (
                      <div>
                        <Label className="text-xs">No of Projects</Label>
                        <Input 
                          type="number" 
                          value={section.styling_config.projects_to_view || 3}
                          onChange={(e) => onUpdateSectionStyling(section.id, { projects_to_view: parseInt(e.target.value) })}
                          min={1} 
                          max={10} 
                          className="h-7 text-xs" 
                          placeholder="Max projects to show"
                        />
                      </div>
                    )}
                  </div>

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
    </div>
  );
};

export default SortableSectionItem;
