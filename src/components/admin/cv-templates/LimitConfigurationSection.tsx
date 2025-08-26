
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Hash } from 'lucide-react';

interface LimitConfigurationSectionProps {
  limits: {
    technicalSkillsLimit: number;
    specializedSkillsLimit: number;
    experiencesLimit: number;
    educationLimit: number;
    trainingsLimit: number;
    achievementsLimit: number;
    projectsLimit: number;
  };
  onLimitChange: (field: string, value: number) => void;
  disabled?: boolean;
}

export const LimitConfigurationSection: React.FC<LimitConfigurationSectionProps> = ({
  limits,
  onLimitChange,
  disabled = false
}) => {
  const handleInputChange = (field: string, value: string) => {
    const numValue = parseInt(value) || 1;
    if (numValue >= 1 && numValue <= 50) {
      onLimitChange(field, numValue);
    }
  };

  const limitFields = [
    { key: 'technicalSkillsLimit', label: 'Technical Skills', value: limits.technicalSkillsLimit },
    { key: 'specializedSkillsLimit', label: 'Specialized Skills', value: limits.specializedSkillsLimit },
    { key: 'experiencesLimit', label: 'Experiences', value: limits.experiencesLimit },
    { key: 'educationLimit', label: 'Education', value: limits.educationLimit },
    { key: 'trainingsLimit', label: 'Trainings', value: limits.trainingsLimit },
    { key: 'achievementsLimit', label: 'Achievements', value: limits.achievementsLimit },
    { key: 'projectsLimit', label: 'Projects', value: limits.projectsLimit },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Data Limits Configuration
        </CardTitle>
        <CardDescription>
          Set the maximum number of items to display for each section in the CV. This helps control the length and focus of the generated CVs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {limitFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-sm font-medium flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {field.label}
              </Label>
              <Input
                id={field.key}
                type="number"
                min="1"
                max="50"
                value={field.value}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                disabled={disabled}
                className="w-full"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>💡 <strong>Tip:</strong> Lower limits create more focused CVs, while higher limits include more comprehensive information.</p>
        </div>
      </CardContent>
    </Card>
  );
};
