
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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

interface SectionFieldConfigProps {
  fields: FieldConfig[];
  onUpdateField: (fieldIndex: number, fieldUpdates: Partial<FieldConfig>) => void;
  onReorderFields: (reorderedFields: FieldConfig[]) => void;
  sectionType?: string;
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
        { field: 'designation', label: 'Designation', enabled: true, masked: false, order: 1 },
        { field: 'company_name', label: 'Company Name', enabled: true, masked: false, order: 2 },
        { field: 'start_date', label: 'Start Date', enabled: true, masked: false, order: 3 },
        { field: 'end_date', label: 'End Date', enabled: true, masked: false, order: 4 },
        { field: 'date_range', label: 'Date Range', enabled: true, masked: false, order: 5 },
        { field: 'is_current', label: 'Current Position', enabled: true, masked: false, order: 6 },
        { field: 'description', label: 'Description', enabled: true, masked: false, order: 7 },
      ];
    case 'education':
      return [
        { field: 'university', label: 'University', enabled: true, masked: false, order: 1 },
        { field: 'degree', label: 'Degree', enabled: true, masked: false, order: 2 },
        { field: 'department', label: 'Department', enabled: true, masked: false, order: 3 },
        { field: 'start_date', label: 'Start Date', enabled: true, masked: false, order: 4 },
        { field: 'end_date', label: 'End Date', enabled: true, masked: false, order: 5 },
        { field: 'gpa', label: 'GPA', enabled: true, masked: false, order: 6 },
      ];
    case 'skills':
    case 'technical_skills':
    case 'specialized_skills':
      return [
        { field: 'name', label: 'Skill Name', enabled: true, masked: false, order: 1 },
        { field: 'proficiency', label: 'Proficiency', enabled: true, masked: false, order: 2 },
      ];
    case 'projects':
      return [
        { field: 'name', label: 'Project Name', enabled: true, masked: false, order: 1 },
        { field: 'role', label: 'Role', enabled: true, masked: false, order: 2 },
        { field: 'start_date', label: 'Start Date', enabled: true, masked: false, order: 3 },
        { field: 'end_date', label: 'End Date', enabled: true, masked: false, order: 4 },
        { field: 'date_range', label: 'Date Range', enabled: true, masked: false, order: 5 },
        { field: 'technologies_used', label: 'Technologies', enabled: true, masked: false, order: 6 },
        { field: 'description', label: 'Description', enabled: true, masked: false, order: 7 },
        { field: 'url', label: 'URL', enabled: true, masked: false, order: 8 },
      ];
    default:
      return [];
  }
};

interface SortableFieldItemProps {
  field: FieldConfig;
  index: number;
  onUpdateField: (fieldIndex: number, fieldUpdates: Partial<FieldConfig>) => void;
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  index,
  onUpdateField
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.field });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded p-2 bg-gray-50">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-3 w-3 text-gray-400" />
          </div>
          <Checkbox
            checked={field.enabled}
            onCheckedChange={(checked) => onUpdateField(index, { enabled: !!checked })}
          />
          <span className="font-medium text-xs">{field.label}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateField(index, { masked: !field.masked })}
          className="h-5 w-5 p-0"
        >
          {field.masked ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
        </Button>
      </div>
      
      {field.masked && (
        <div className="mt-1">
          <Input
            value={field.mask_value || ''}
            onChange={(e) => onUpdateField(index, { mask_value: e.target.value })}
            placeholder="e.g., ***-****"
            className="h-6 text-xs"
          />
        </div>
      )}
    </div>
  );
};

const SectionFieldConfig: React.FC<SectionFieldConfigProps> = ({
  fields,
  onUpdateField,
  onReorderFields,
  sectionType = ''
}) => {
  // Use provided fields or default fields for the section type
  const fieldsToRender = fields.length > 0 ? fields : getDefaultFields(sectionType);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fieldsToRender.findIndex(field => field.field === active.id);
      const newIndex = fieldsToRender.findIndex(field => field.field === over?.id);

      const reorderedFields = arrayMove(fieldsToRender, oldIndex, newIndex);
      
      // Update order values
      const fieldsWithUpdatedOrder = reorderedFields.map((field, idx) => ({
        ...field,
        order: idx + 1
      }));

      onReorderFields(fieldsWithUpdatedOrder);
    }
  };

  return (
    <div>
      <Label className="text-xs font-medium mb-2 block">Fields</Label>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fieldsToRender.map(f => f.field)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {fieldsToRender.map((field, fieldIndex) => (
              <SortableFieldItem
                key={field.field}
                field={field}
                index={fieldIndex}
                onUpdateField={onUpdateField}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SectionFieldConfig;
