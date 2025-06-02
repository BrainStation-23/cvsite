
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  const [defaultFields, setDefaultFields] = useState<FieldConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sectionType && fields.length === 0) {
      loadDefaultFields();
    }
  }, [sectionType, fields.length]);

  const loadDefaultFields = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_section_fields', {
        section_type_param: sectionType
      });

      if (error) throw error;
      
      const fieldConfigs = (data || []).map((field: any) => ({
        field: field.field_name,
        label: field.display_label,
        enabled: field.default_enabled,
        masked: field.default_masked,
        mask_value: field.default_mask_value,
        order: field.default_order
      }));

      setDefaultFields(fieldConfigs);
    } catch (error) {
      console.error('Error loading default fields:', error);
      setDefaultFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Use provided fields or default fields for the section type
  const fieldsToRender = fields.length > 0 ? fields : defaultFields;

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

  if (isLoading) {
    return (
      <div>
        <Label className="text-xs font-medium mb-2 block">Fields</Label>
        <div className="text-xs text-gray-500">Loading fields...</div>
      </div>
    );
  }

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
