
import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface ExperienceTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

export const useExperienceTour = () => {
  const [tourState, setTourState] = useState<ExperienceTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="add-experience-button"]',
        content: 'Click this button to add a new work experience entry. You can add multiple positions at different companies.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="experience-form"]',
        content: 'When adding or editing experience, fill out this form with your company details, position, and work duration.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-company"]',
        content: 'Enter the company name where you worked. This will be grouped with other positions at the same company.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="experience-designation"]',
        content: 'Select or enter your job title/designation. The system will suggest common designations as you type.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="experience-start-date"]',
        content: 'Select when you started this position. Use the calendar picker to choose the exact date.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-end-date"]',
        content: 'Select when you ended this position, or check "Current Position" if you still work there.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-current-checkbox"]',
        content: 'Check this box if this is your current position. This will automatically clear the end date.',
        placement: 'left',
      },
      {
        target: '[data-tour="experience-description"]',
        content: 'Describe your role, responsibilities, and achievements. You can use rich text formatting to highlight important points.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-save-button"]',
        content: 'Click here to save your experience entry. You can always edit it later by clicking the edit button.',
        placement: 'left',
      },
      {
        target: '[data-tour="experience-empty-state"]',
        content: 'When you have no experience entries yet, this message will guide you to add your first work experience.',
        placement: 'top',
      },
    ],
    stepIndex: 0,
  });

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    if (type === 'step:after' && action === 'next') {
      const nextStepIndex = index + 1;
      setTourState(prev => ({ ...prev, stepIndex: nextStepIndex }));
    }
  }, []);

  const startTour = useCallback(() => {
    setTourState(prev => ({ 
      ...prev, 
      run: true, 
      stepIndex: 0 
    }));
  }, []);

  const stopTour = useCallback(() => {
    setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
  }, []);

  return {
    tourState,
    handleJoyrideCallback,
    startTour,
    stopTour,
  };
};
