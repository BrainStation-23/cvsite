import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FeedbackType } from '../types/feedback';
import { BugReportForm, BugReportFormValues } from './BugReport/BugReportForm';
import { FeatureRequestForm, FeatureRequestFormValues } from './FeatureRequest/FeatureRequestForm';
import ReviewStep from './ReviewStep';

type Step = 'form' | 'review';

interface FeedbackFormProps {
  type: FeedbackType;
  onBack: () => void;
}

export function FeedbackForm({ type, onBack }: FeedbackFormProps) {
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<BugReportFormValues | FeatureRequestFormValues | null>(null);

  const handleFormSubmit = async (data: BugReportFormValues | FeatureRequestFormValues) => {
    setFormData(data);
    setStep('review');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
        >
          ← Back
        </Button>
        <h2 className="text-xl font-semibold">
          {type === 'bug' ? 'Report a Bug' : 'Request a Feature'}
        </h2>
      </div>

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
