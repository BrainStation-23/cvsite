
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';

interface SectionAddFormProps {
  newSectionType: CVSectionType;
  onSectionTypeChange: (value: CVSectionType) => void;
  onAddSection: () => void;
  availableSectionTypes: { value: CVSectionType; label: string }[];
}

const SectionAddForm: React.FC<SectionAddFormProps> = ({
  newSectionType,
  onSectionTypeChange,
  onAddSection,
  availableSectionTypes
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Add Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Section Type</Label>
          <Select value={newSectionType} onValueChange={onSectionTypeChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableSectionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={onAddSection} 
          disabled={availableSectionTypes.length === 0}
          size="sm"
          className="w-full h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Section
        </Button>
      </CardContent>
    </Card>
  );
};

export default SectionAddForm;
