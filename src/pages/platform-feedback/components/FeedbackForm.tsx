import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FeedbackType } from '../types/feedback';
import { BugReportForm, BugReportFormValues } from './BugReport/BugReportForm';
import { FeatureRequestForm, FeatureRequestFormValues } from './FeatureRequest/FeatureRequestForm';
import ReviewStep from './ReviewStep';
import { CheckCircle, Edit, Eye, Github } from 'lucide-react';

type Step = 'form' | 'review';

interface FeedbackFormProps {
  type: FeedbackType;
  onBack: () => void;
}

export function FeedbackForm({ type, onBack }: FeedbackFormProps) {
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<BugReportFormValues | FeatureRequestFormValues | null>(null);

  const steps = [
    { label: 'Fill Form', icon: <Edit className="h-5 w-5" /> },
    { label: 'Open GitHub Issue', icon: <Github className="h-5 w-5" /> },
  ];

  const handleFormSubmit = async (data: BugReportFormValues | FeatureRequestFormValues) => {
    setFormData(data);
    setStep('review');
  };

  return (
    <div className="space-y-8">
      {/* Progress Stepper with Back button left, steps centered */}
      <div className="flex items-center justify-between w-full mx-auto mt-1">
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="ml-2"
          >
            ← Back
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          {steps.map((s, idx) => {
            const isActive = (step === 'form' && idx === 0) || (step === 'review' && idx === 1);
            const isDone = step === 'review' && idx === 0;
            const isLast = idx === steps.length - 1;
            return (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full border-2 flex items-center justify-center transition-all
                      ${isActive ? 'border-primary bg-primary/90 text-white shadow-xl scale-110' : isDone ? 'border-green-500 bg-green-500 text-white shadow scale-100' : 'border-muted bg-muted text-muted-foreground'}
                      h-14 w-14 mb-1 duration-200`}
                  >
                    {isDone ? <CheckCircle className="h-7 w-7 text-white" /> : s.icon}
                  </div>

                  <span className={`text-base font-semibold text-center ${isActive ? 'text-primary' : isDone ? 'text-green-700' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`ml-8 mr-4 h-2 rounded-full w-24 shadow transition-all 
                      ${isActive ? 'bg-gradient-to-r from-primary/80 to-primary/30' : isDone ? 'bg-gradient-to-r from-green-500 to-primary/20' : 'bg-gradient-to-r from-muted to-muted/40'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex-shrink-0 w-16" /> {/* Spacer for symmetry */}
      </div>

      {/* Main content */}
      {step === 'form' && (
        type === 'bug' ? (
          <BugReportForm onSubmit={handleFormSubmit} isSubmitting={false} />
        ) : (
          <FeatureRequestForm onSubmit={handleFormSubmit} isSubmitting={false} />
        )
      )}

      {step === 'review' && formData && (
        <ReviewStep 
          type={type} 
          formData={formData} 
          onBack={() => setStep('form')} 
        />
      )}
    </div>
  );
}
