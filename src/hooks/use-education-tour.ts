
import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface EducationTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

export const useEducationTour = () => {
  const [tourState, setTourState] = useState<EducationTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="add-education-button"]',
        content: 'Click this button to add a new education entry. You can add multiple degrees from different institutions.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="education-university"]',
        content: 'Select your university or educational institution. You can search and select from the available options.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="education-degree"]',
        content: 'Choose your degree type (Bachelor\'s, Master\'s, PhD, etc.). This helps categorize your educational background.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="education-department"]',
        content: 'Select your department or field of study. This is optional but helps provide more detail about your specialization.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="education-start-date"]',
        content: 'Set when you started this educational program. Use the calendar picker to select the date.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="education-end-date"]',
        content: 'Set your graduation date. If you\'re still studying, you can check the "Currently Studying" option instead.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="education-current-checkbox"]',
        content: 'Check this if you\'re currently studying. This will disable the end date field and mark it as ongoing.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="education-gpa"]',
        content: 'Add your GPA or grade if you want to include it. This field is optional but can strengthen your profile.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="education-save-button"]',
        content: 'Click here to save your education entry. Make sure all required fields are filled before saving.',
        placement: 'top',
        disableBeacon: true,
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
      // If we're on the first step (add button), simulate clicking it
      if (index === 0) {
        const addButton = document.querySelector('[data-tour="add-education-button"]') as HTMLButtonElement;
        if (addButton) {
          addButton.click();
        }
      }
      setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
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
