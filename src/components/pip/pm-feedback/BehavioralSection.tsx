
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface BehavioralSectionProps {
  behavioralAreas: string[];
  behavioralGapDescription: string;
  behavioralGapExample: string;
  onBehavioralAreasChange: (areas: string[]) => void;
  onBehavioralGapDescriptionChange: (value: string) => void;
  onBehavioralGapExampleChange: (value: string) => void;
  errors?: {
    behavioral_areas?: string;
    behavioral_gap_description?: string;
    behavioral_gap_example?: string;
  };
}

const BEHAVIORAL_AREA_OPTIONS = [
  'Communication',
  'Collaboration & Teamwork',
  'Accountability & Ownership',
  'Time Management & Deadlines',
  'Adaptability to Change',
  'Attitude / Professionalism',
  'Leadership / Initiative',
  'Other'
];

export const BehavioralSection: React.FC<BehavioralSectionProps> = ({
  behavioralAreas,
  behavioralGapDescription,
  behavioralGapExample,
  onBehavioralAreasChange,
  onBehavioralGapDescriptionChange,
  onBehavioralGapExampleChange,
  errors
}) => {
  const handleBehavioralAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      onBehavioralAreasChange([...behavioralAreas, area]);
    } else {
      onBehavioralAreasChange(behavioralAreas.filter(a => a !== area));
    }
  };

  const isComplete = behavioralAreas.length > 0 && behavioralGapDescription.length > 0 && behavioralGapExample.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
          Section 2: Soft Skills & Behavioral Aspects
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select the behavioral area(s) where improvement is needed and give specific work-related examples.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Behavioral Area (Select one or more) *</Label>
          <div className="grid grid-cols-2 gap-3">
            {BEHAVIORAL_AREA_OPTIONS.map((area) => (
              <div key={area} className="flex items-center space-x-2">
                <Checkbox
                  id={`behavioral-${area}`}
                  checked={behavioralAreas.includes(area)}
                  onCheckedChange={(checked) => handleBehavioralAreaChange(area, checked as boolean)}
                />
                <Label
                  htmlFor={`behavioral-${area}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {area}
                </Label>
              </div>
            ))}
          </div>
          {errors?.behavioral_areas && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {errors.behavioral_areas}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="behavioral_gap_description" className="text-sm font-medium">
            Observed Gap (Short text) *
          </Label>
          <Textarea
            id="behavioral_gap_description"
            value={behavioralGapDescription}
            onChange={(e) => onBehavioralGapDescriptionChange(e.target.value)}
            placeholder="Describe the specific behavioral gaps observed..."
            className="min-h-[100px]"
          />
          {errors?.behavioral_gap_description && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {errors.behavioral_gap_description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="behavioral_gap_example" className="text-sm font-medium">
            Example (Task/Scenario) *
          </Label>
          <Textarea
            id="behavioral_gap_example"
            value={behavioralGapExample}
            onChange={(e) => onBehavioralGapExampleChange(e.target.value)}
            placeholder="e.g., Often misses deadlines without prior communication; Avoids collaboration during sprint meetings; Hesitates to take ownership of assigned tasks."
            className="min-h-[100px]"
          />
          {errors?.behavioral_gap_example && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {errors.behavioral_gap_example}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
