
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SkillTagsInput from '../SkillTagsInput';

interface ProfessionalFiltersSectionProps {
  skillInput: string;
  companyInput: string;
  experienceYears: number[];
  onSkillFilter: (skills: string[]) => void;
  onCompanyFilter: (company: string) => void;
  onExperienceYearsChange: (years: number[]) => void;
  isLoading: boolean;
}

const ProfessionalFiltersSection: React.FC<ProfessionalFiltersSectionProps> = ({
  skillInput,
  companyInput,
  experienceYears,
  onSkillFilter,
  onCompanyFilter,
  onExperienceYearsChange,
  isLoading
}) => {
  const handleSkillTagsChange = (skills: string[]) => {
    onSkillFilter(skills);
  };

  const handleCompanyChange = (value: string) => {
    onCompanyFilter(value);
  };

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          Professional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">Skills</Label>
            <SkillTagsInput
              value={skillInput ? skillInput.split(',').map(s=>s.trim()).filter(Boolean) : []}
              onChange={handleSkillTagsChange}
              placeholder="Search/add skills..."
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">Company</Label>
            <Input
              placeholder="Search company..."
              value={companyInput}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="text-xs h-7 w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Experience: {experienceYears[0]}-{experienceYears[1]} years
          </Label>
          <Slider
            value={experienceYears}
            onValueChange={onExperienceYearsChange}
            max={20}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalFiltersSection;
