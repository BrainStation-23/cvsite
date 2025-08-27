
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface SkillGapsSectionProps {
  skillAreas: string[];
  skillGapDescription: string;
  skillGapExample: string;
  onSkillAreasChange: (areas: string[]) => void;
  onSkillGapDescriptionChange: (value: string) => void;
  onSkillGapExampleChange: (value: string) => void;
  errors?: {
    skill_areas?: string;
    skill_gap_description?: string;
    skill_gap_example?: string;
  };
  isReadOnly?: boolean;
}

const SKILL_AREA_OPTIONS = [
  'Domain Knowledge',
  'Functional Knowledge',
  'Technical Tools & Software',
  'Programming/Development Skills',
  'Testing/Quality Assurance Skills',
  'Analytical & Problem-Solving Skills',
  'Process Knowledge & Compliance',
  'Other'
];

export const SkillGapsSection: React.FC<SkillGapsSectionProps> = ({
  skillAreas,
  skillGapDescription,
  skillGapExample,
  onSkillAreasChange,
  onSkillGapDescriptionChange,
  onSkillGapExampleChange,
  errors,
  isReadOnly = false
}) => {
  const handleSkillAreaChange = (area: string, checked: boolean) => {
    if (isReadOnly) return;
    
    if (checked) {
      onSkillAreasChange([...skillAreas, area]);
    } else {
      onSkillAreasChange(skillAreas.filter(a => a !== area));
    }
  };

  const isComplete = skillAreas.length > 0 && skillGapDescription.length > 0 && skillGapExample.length > 0;

  return (
    <Card className={isReadOnly ? 'opacity-75' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
          Section 1: Technical / Functional Skill Gaps
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isReadOnly 
            ? 'Review the selected skill areas and examples of gaps observed.'
            : 'Select the relevant skill area(s), add examples of actual gaps observed, and mention how the gap impacted work.'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Skill Area (Select one or more) *</Label>
          <div className="grid grid-cols-2 gap-3">
            {SKILL_AREA_OPTIONS.map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${area}`}
                  checked={skillAreas.includes(area)}
                  onCheckedChange={(checked) => handleSkillAreaChange(area, checked as boolean)}
                  disabled={isReadOnly}
                />
                <Label
                  htmlFor={`skill-${area}`}
                  className={`text-sm font-normal ${!isReadOnly ? 'cursor-pointer' : 'cursor-default'} ${isReadOnly && !skillAreas.includes(area) ? 'text-muted-foreground' : ''}`}
                >
                  {area}
                </Label>
              </div>
            ))}
          </div>
          {!isReadOnly && errors?.skill_areas && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {errors.skill_areas}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="skill_gap_description" className="text-sm font-medium">
            Observed Gap (Short text) *
          </Label>
          <Textarea
            id="skill_gap_description"
            value={skillGapDescription}
            onChange={(e) => onSkillGapDescriptionChange(e.target.value)}
            placeholder={isReadOnly ? '' : 'Describe the specific skill gaps observed...'}
            className={`min-h-[100px] ${isReadOnly ? 'bg-muted text-muted-foreground cursor-default' : ''}`}
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
          {!isReadOnly && errors?.skill_gap_description && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {errors.skill_gap_description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="skill_gap_example" className="text-sm font-medium">
            Example (Task/Scenario) *
          </Label>
          <Textarea
            id="skill_gap_example"
            value={skillGapExample}
            onChange={(e) => onSkillGapExampleChange(e.target.value)}
            placeholder={isReadOnly ? '' : 'e.g., In QA, missed multiple critical test cases leading to production bugs; In Sales, unable to explain product features during client demo; In HR, delayed payroll due to errors in data entry.'}
            className={`min-h-[100px] ${isReadOnly ? 'bg-muted text-muted-foreground cursor-default' : ''}`}
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
          {!isReadOnly && errors?.skill_gap_example && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {errors.skill_gap_example}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
