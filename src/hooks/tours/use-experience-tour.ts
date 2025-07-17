
import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

interface ExperienceTourState {
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
        target: '[data-tour="experience-empty-state"]',
        content: 'When you have no experience entries yet, this message will guide you to add your first work experience.',
        placement: 'top',
      },
    ],
    stepIndex: 0,
  });

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === 'close') {
      setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    if (type === 'step:after') {
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
