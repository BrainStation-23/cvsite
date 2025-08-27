import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface PIPStatusTimelineProps {
  status: string;
}

const statusSteps = [
  { key: 'hr_initiation', label: 'HR Initiation', description: 'PIP created by HR' },
  { key: 'pm_feedback', label: 'PM Feedback', description: 'Awaiting project manager input' },
  { key: 'hr_review', label: 'HR Review', description: 'HR reviewing PM feedback' },
  { key: 'ld_goal_setting', label: 'Goal Setting', description: 'Leadership defining improvement goals' },
  { key: 'mid_review', label: 'Mid Review', description: 'Progress evaluation' },
  { key: 'final_review', label: 'Final Review', description: 'Final assessment and outcome' },
];

export const PIPStatusTimeline: React.FC<PIPStatusTimelineProps> = ({
  status,
}) => {
  const currentStepIndex = statusSteps.findIndex(step => step.key === status);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'text-green-600 bg-green-100';
    if (stepIndex === currentStepIndex) return 'text-blue-600 bg-blue-100';
    return 'text-gray-400 bg-gray-100';
  };

  const getStatusIcon = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return <CheckCircle className="h-4 w-4" />;
    if (stepIndex === currentStepIndex) return <Clock className="h-4 w-4" />;
    return <Circle className="h-4 w-4" />;
  };

  return (
    <div className="gap-6">
      {/* Timeline Card */}
      <div>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6">PIP Progress Timeline</h3>

            {/* Horizontal Timeline */}
            <div className="relative">
              {/* Horizontal Progress Line */}
              <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-200"></div>
              
              {/* Current Progress Line */}
              <div 
                className="absolute top-8 left-0 h-0.5 bg-blue-500 transition-all duration-500"
                style={{ 
                  width: `${(currentStepIndex / Math.max(statusSteps.length - 1, 1)) * 100}%` 
                }}
              ></div>

              {/* Steps */}
              <div className="flex justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center text-center max-w-24">
                    <div className={`relative z-10 rounded-full p-2 mb-3 ${getStatusColor(index)}`}>
                      {getStatusIcon(index)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-col items-center gap-1">
                        <h4 className="font-medium text-sm leading-tight">{step.label}</h4>
                        {index === currentStepIndex && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                        {index < currentStepIndex && (
                          <Badge variant="secondary" className="text-xs">Completed</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
