
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface PIPFormProgressProps {
  completedSteps: number;
  totalSteps: number;
  steps: Array<{ name: string; completed: boolean }>;
}

export const PIPFormProgress: React.FC<PIPFormProgressProps> = ({
  completedSteps,
  totalSteps,
  steps
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Performance Improvement Plan</CardTitle>
            <CardDescription>
              Create or edit a PIP for an employee with detailed feedback and timeline
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Progress: {completedSteps}/{totalSteps}</span>
            </div>
            <div className="flex gap-1">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`w-8 h-2 rounded ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  title={step.name}
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
