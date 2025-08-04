
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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

  const handleMinExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const minValue = value === '' ? 0 : Math.max(0, parseInt(value) || 0);
    onExperienceYearsChange([minValue, experienceYears[1]]);
  };

  const handleMaxExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const maxValue = value === '' ? 20 : Math.min(50, Math.max(experienceYears[0], parseInt(value) || 20));
    onExperienceYearsChange([experienceYears[0], maxValue]);
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

        <div className="space-y-2">
          <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Years of Experience
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-blue-600 dark:text-blue-400">Min Years</Label>
              <Input
                type="number"
                min="0"
                max="50"
                placeholder="0"
                value={experienceYears[0] || ''}
                onChange={handleMinExperienceChange}
                className="text-xs h-7"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-blue-600 dark:text-blue-400">Max Years</Label>
              <Input
                type="number"
                min="0"
                max="50"
                placeholder="20"
                value={experienceYears[1] || ''}
                onChange={handleMaxExperienceChange}
                className="text-xs h-7"
              />
            </div>
          </div>
          {(experienceYears[0] > 0 || experienceYears[1] < 20) && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Filtering: {experienceYears[0]} - {experienceYears[1]} years
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalFiltersSection;
