
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AlertTriangle } from 'lucide-react';

interface PIPFeedbackSectionProps {
  overallFeedback: string;
  finalReview?: string;
  onOverallFeedbackChange: (value: string) => void;
  onFinalReviewChange?: (value: string) => void;
  errors?: {
    overall_feedback?: string;
    final_review?: string;
  };
  showFinalReview?: boolean;
}

export const PIPFeedbackSection: React.FC<PIPFeedbackSectionProps> = ({
  overallFeedback,
  finalReview,
  onOverallFeedbackChange,
  onFinalReviewChange,
  errors,
  showFinalReview = false
}) => {
  const isFeedbackComplete = overallFeedback?.length >= 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`w-3 h-3 rounded-full ${isFeedbackComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
          Step 3: Performance Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="overall_feedback" className="text-sm font-medium">Overall Feedback *</Label>
          <RichTextEditor
            value={overallFeedback}
            onChange={onOverallFeedbackChange}
            placeholder="Provide detailed feedback regarding performance issues and improvement areas..."
            className="min-h-[200px]"
          />
          {errors?.overall_feedback && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {errors.overall_feedback}
            </p>
          )}
        </div>

        {showFinalReview && onFinalReviewChange && (
          <div className="space-y-2">
            <Label htmlFor="final_review" className="text-sm font-medium">Final Review</Label>
            <RichTextEditor
              value={finalReview || ''}
              onChange={onFinalReviewChange}
              placeholder="Provide final review and outcome of the PIP..."
              className="min-h-[150px]"
            />
            {errors?.final_review && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.final_review}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
