
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
  sectionType?: string;
}

// Define default fields for each section type
const getDefaultFields = (sectionType: string): FieldConfig[] => {
  switch (sectionType) {
    case 'general':
      return [
        { field: 'first_name', label: 'First Name', enabled: true, masked: false, order: 1 },
        { field: 'last_name', label: 'Last Name', enabled: true, masked: false, order: 2 },
        { field: 'employee_id', label: 'Employee ID', enabled: true, masked: false, order: 3 },
        { field: 'profile_image', label: 'Profile Image', enabled: true, masked: false, order: 4 },
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
    default:
      return [];
  }
};

const SectionFieldConfig: React.FC<SectionFieldConfigProps> = ({
  fields,
  onUpdateField,
  sectionType = ''
}) => {
  // Use provided fields or default fields for the section type
  const fieldsToRender = fields.length > 0 ? fields : getDefaultFields(sectionType);

  return (
    <div>
      <Label className="text-xs font-medium mb-2 block">Fields</Label>
      <div className="space-y-2">
        {fieldsToRender.map((field, fieldIndex) => (
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
                  placeholder="e.g., ***-****"
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
