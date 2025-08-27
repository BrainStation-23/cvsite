
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { PIPPMFeedbackFormData, PIPPMFeedback } from '@/types/pip';
import { SkillGapsSection } from './SkillGapsSection';
import { BehavioralSection } from './BehavioralSection';

const pmFeedbackSchema = z.object({
  skill_areas: z.array(z.string()).min(1, 'Please select at least one skill area'),
  skill_gap_description: z.string().min(10, 'Description must be at least 10 characters'),
  skill_gap_example: z.string().min(10, 'Example must be at least 10 characters'),
  behavioral_areas: z.array(z.string()).min(1, 'Please select at least one behavioral area'),
  behavioral_gap_description: z.string().min(10, 'Description must be at least 10 characters'),
  behavioral_gap_example: z.string().min(10, 'Example must be at least 10 characters'),
});

interface PIPPMFeedbackFormProps {
  initialData?: PIPPMFeedback | null;
  onSubmit: (data: PIPPMFeedbackFormData) => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export const PIPPMFeedbackForm: React.FC<PIPPMFeedbackFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  isEditing = false
}) => {
  const form = useForm<PIPPMFeedbackFormData>({
    resolver: zodResolver(pmFeedbackSchema),
    defaultValues: {
      skill_areas: initialData?.skill_areas || [],
      skill_gap_description: initialData?.skill_gap_description || '',
      skill_gap_example: initialData?.skill_gap_example || '',
      behavioral_areas: initialData?.behavioral_areas || [],
      behavioral_gap_description: initialData?.behavioral_gap_description || '',
      behavioral_gap_example: initialData?.behavioral_gap_example || '',
    }
  });

  const { handleSubmit, setValue, watch, formState: { errors } } = form;

  const watchedSkillAreas = watch('skill_areas');
  const watchedSkillGapDescription = watch('skill_gap_description');
  const watchedSkillGapExample = watch('skill_gap_example');
  const watchedBehavioralAreas = watch('behavioral_areas');
  const watchedBehavioralGapDescription = watch('behavioral_gap_description');
  const watchedBehavioralGapExample = watch('behavioral_gap_example');

  const isFormValid = watchedSkillAreas.length > 0 && 
                     watchedSkillGapDescription.length >= 10 && 
                     watchedSkillGapExample.length >= 10 &&
                     watchedBehavioralAreas.length > 0 && 
                     watchedBehavioralGapDescription.length >= 10 && 
                     watchedBehavioralGapExample.length >= 10;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <SkillGapsSection
        skillAreas={watchedSkillAreas}
        skillGapDescription={watchedSkillGapDescription}
        skillGapExample={watchedSkillGapExample}
        onSkillAreasChange={(areas) => setValue('skill_areas', areas)}
        onSkillGapDescriptionChange={(value) => setValue('skill_gap_description', value)}
        onSkillGapExampleChange={(value) => setValue('skill_gap_example', value)}
        errors={{
          skill_areas: errors.skill_areas?.message,
          skill_gap_description: errors.skill_gap_description?.message,
          skill_gap_example: errors.skill_gap_example?.message,
        }}
      />

      <BehavioralSection
        behavioralAreas={watchedBehavioralAreas}
        behavioralGapDescription={watchedBehavioralGapDescription}
        behavioralGapExample={watchedBehavioralGapExample}
        onBehavioralAreasChange={(areas) => setValue('behavioral_areas', areas)}
        onBehavioralGapDescriptionChange={(value) => setValue('behavioral_gap_description', value)}
        onBehavioralGapExampleChange={(value) => setValue('behavioral_gap_example', value)}
        errors={{
          behavioral_areas: errors.behavioral_areas?.message,
          behavioral_gap_description: errors.behavioral_gap_description?.message,
          behavioral_gap_example: errors.behavioral_gap_example?.message,
        }}
      />

      <div className="sticky bottom-0 bg-background border-t p-4 -mx-6 -mb-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {isFormValid ? '✓ All sections completed' : 'Please complete all required sections'}
          </div>
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Feedback' : 'Save Feedback')}
          </Button>
        </div>
      </div>
    </form>
  );
};
