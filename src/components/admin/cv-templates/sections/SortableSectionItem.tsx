
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
import { DISPLAY_STYLES } from './SectionConstants';
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
    items_per_column?: number;
    fields?: FieldConfig[];
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
  getSectionLabel: (type: CVSectionType) => string;
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
  getSectionLabel
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

  const showItemsPerColumn = section.section_type !== 'general';

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
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
                onClick={() => onToggleExpanded(section.id)}
                className="h-6 w-6 p-0"
              >
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
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

          <Collapsible open={expandedSections.has(section.id)}>
            <CollapsibleContent>
              <div className="space-y-3 pt-2 border-t">
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
                  {showItemsPerColumn && (
                    <div>
                      <Label className="text-xs">Items per Column</Label>
                      <Input 
                        type="number" 
                        value={section.styling_config.items_per_column || 1}
                        onChange={(e) => onUpdateSectionStyling(section.id, { items_per_column: parseInt(e.target.value) })}
                        min={1} 
                        max={3} 
                        className="h-7 text-xs" 
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
        </CardContent>
      </Card>
    </div>
  );
};

export default SortableSectionItem;
