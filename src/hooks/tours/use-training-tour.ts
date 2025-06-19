

import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface TrainingTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

export const useTrainingTour = () => {
  const [tourState, setTourState] = useState<TrainingTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="add-training-button"]',
        content: 'Click this button to add a new training or certification entry. You can add multiple certifications from different providers.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="training-title"]',
        content: 'Enter the name or title of your certification or training program. Be specific about the exact certification you received.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="training-provider"]',
        content: 'Enter the organization or provider that issued this certification (e.g., Amazon Web Services, Microsoft, Google).',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="training-date"]',
        content: 'Select the date when you received this certification or completed the training. Use the calendar picker to choose the date.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="training-description"]',
        content: 'Add an optional description of what this certification covers or what skills you gained from the training.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="training-certificate-url"]',
        content: 'If you have an online certificate or verification link, you can add it here. This is optional but adds credibility.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="training-save-button"]',
        content: 'Click here to save your training entry. Make sure all required fields are filled before saving.',
        placement: 'top',
        disableBeacon: true,
      },
    ],
    stepIndex: 0,
  });

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (status === STATUS.FINISHED 
      || status === STATUS.SKIPPED
      ||  action === 'close'
    ) {
      setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    if (type === 'step:after') {
      if (action === 'next') {
        // If we're on the first step (add button), simulate clicking it
        if (index === 0) {
          const addButton = document.querySelector('[data-tour="add-training-button"]') as HTMLButtonElement;
          if (addButton) {
            addButton.click();
          }
        }
        setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
      } else if (action === 'prev') {
        setTourState(prev => ({ ...prev, stepIndex: Math.max(0, index - 1) }));
      }
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

