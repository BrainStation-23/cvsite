
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FieldConfig {
  field: string;
  label: string;
  enabled: boolean;
  masked: boolean;
  mask_value?: string;
  order: number;
}

interface SectionFieldConfigProps {
  displayStyle?: string;
  itemsPerColumn?: number;
  onDisplayStyleChange?: (value: string) => void;
  onItemsPerColumnChange?: (value: number) => void;
  sectionType?: string;
  fields?: FieldConfig[];
  onUpdateField?: (fieldIndex: number, fieldUpdates: Partial<FieldConfig>) => void;
  onReorderFields?: (reorderedFields: FieldConfig[]) => void;
}

const DISPLAY_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'timeline', label: 'Timeline' },
];

const SectionFieldConfig: React.FC<SectionFieldConfigProps> = ({
  displayStyle,
  itemsPerColumn,
  onDisplayStyleChange,
  onItemsPerColumnChange,
  sectionType,
  fields,
  onUpdateField,
  onReorderFields
}) => {
  // Don't show items per column for general section as it doesn't make sense
  const showItemsPerColumn = sectionType !== 'general' && sectionType !== 'projects' && onItemsPerColumnChange;
  const showProjectsCount = sectionType === 'projects' && onItemsPerColumnChange;

  return (
    <div className="grid grid-cols-1 gap-2">
      {displayStyle !== undefined && onDisplayStyleChange && (
        <div>
          <Label className="text-xs">Display Style</Label>
          <Select value={displayStyle} onValueChange={onDisplayStyleChange}>
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
      )}
      
      {showItemsPerColumn && (
        <div>
          <Label className="text-xs">Items per Column</Label>
          <Input 
            type="number" 
            value={itemsPerColumn || 1}
            onChange={(e) => onItemsPerColumnChange!(parseInt(e.target.value))}
            min={1} 
            max={3} 
            className="h-7 text-xs" 
          />
        </div>
      )}

      {showProjectsCount && (
        <div>
          <Label className="text-xs">No of Projects</Label>
          <Input 
            type="number" 
            value={itemsPerColumn || 3}
            onChange={(e) => onItemsPerColumnChange!(parseInt(e.target.value))}
            min={1} 
            max={10} 
            className="h-7 text-xs" 
            placeholder="Max projects to show"
          />
        </div>
      )}

      {/* Field configuration section - placeholder for future field management */}
      {fields && onUpdateField && onReorderFields && (
        <div className="mt-2 pt-2 border-t">
          <Label className="text-xs text-gray-500">Field Configuration</Label>
          <div className="text-xs text-gray-400 mt-1">
            {fields.length} fields configured
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionFieldConfig;
