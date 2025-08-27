
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';

interface ProgressIndicatorProps {
  skillSectionComplete: boolean;
  behavioralSectionComplete: boolean;
  isFormValid: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  skillSectionComplete,
  behavioralSectionComplete,
  isFormValid
}) => {
  const steps = [
    {
      id: 'skill',
      title: 'Technical Skills',
      complete: skillSectionComplete
    },
    {
      id: 'behavioral',
      title: 'Behavioral Aspects',
      complete: behavioralSectionComplete
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Feedback Progress</h3>
          <span className="text-xs text-muted-foreground">
            {steps.filter(s => s.complete).length} of {steps.length} sections complete
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              {step.complete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={`text-sm ${step.complete ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${step.complete ? 'bg-green-600' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        
        {isFormValid && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-green-800 font-medium">
              ✓ All sections completed. Ready to submit!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
