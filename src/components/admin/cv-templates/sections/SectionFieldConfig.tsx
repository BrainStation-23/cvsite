
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

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
}

const SectionFieldConfig: React.FC<SectionFieldConfigProps> = ({
  fields,
  onUpdateField
}) => {
  return (
    <div>
      <Label className="text-xs font-medium mb-2 block">Fields</Label>
      <div className="space-y-2">
        {fields.map((field, fieldIndex) => (
          <div key={field.field} className="border rounded p-2 bg-gray-50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={field.enabled}
                  onCheckedChange={(checked) => onUpdateField(fieldIndex, { enabled: !!checked })}
                />
                <span className="font-medium text-xs">{field.label}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateField(fieldIndex, { masked: !field.masked })}
                className="h-5 w-5 p-0"
              >
                {field.masked ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
              </Button>
            </div>
            
            {field.masked && (
              <div className="mt-1">
                <Input
                  value={field.mask_value || ''}
                  onChange={(e) => onUpdateField(fieldIndex, { mask_value: e.target.value })}
                  placeholder="e.g., EMP-***"
                  className="h-6 text-xs"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionFieldConfig;
