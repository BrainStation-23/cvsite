
import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversityCombobox } from '@/components/admin/university/UniversityCombobox';
import { TrainingProviderCombobox } from '@/components/admin/training/TrainingProviderCombobox';
import GraduationYearRangeControl from '../GraduationYearRangeControl';

interface EducationFiltersSectionProps {
  universityInput: string;
  trainingInput: string;
  minGraduationYear: number | null;
  maxGraduationYear: number | null;
  onUniversityChange: (value: string) => void;
  onTrainingChange: (value: string) => void;
  onGraduationYearChange: (minYear: number | null, maxYear: number | null) => void;
  isLoading: boolean;
}

const EducationFiltersSection: React.FC<EducationFiltersSectionProps> = ({
  universityInput,
  trainingInput,
  minGraduationYear,
  maxGraduationYear,
  onUniversityChange,
  onTrainingChange,
  onGraduationYearChange,
  isLoading
}) => {
  const handleGraduationYearChange = (minYear: number | null, maxYear: number | null) => {
    onGraduationYearChange(minYear, maxYear);
  };

  return (
    <Card className="border-green-200 bg-green-50/30 dark:bg-green-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          Education & Training
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-green-700 dark:text-green-300">University</Label>
            <UniversityCombobox
              value={universityInput}
              onValueChange={onUniversityChange}
              placeholder="Search university..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-green-700 dark:text-green-300">Training Provider</Label>
            <TrainingProviderCombobox
              value={trainingInput}
              onValueChange={onTrainingChange}
              placeholder="Search training provider..."
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-green-700 dark:text-green-300">Graduation Years</Label>
          <GraduationYearRangeControl
            minYear={minGraduationYear}
            maxYear={maxGraduationYear}
            onMinYearChange={(year) => handleGraduationYearChange(year, maxGraduationYear)}
            onMaxYearChange={(year) => handleGraduationYearChange(minGraduationYear, year)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationFiltersSection;
