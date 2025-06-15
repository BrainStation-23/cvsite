
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
        target: '[data-tour="education-empty-state"]',
        content: 'When you have no education entries yet, this message will guide you to add your first educational background.',
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
