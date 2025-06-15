
import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface ExperienceTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

export const useExperienceTour = (onStartFormTour?: () => void) => {
  const [tourState, setTourState] = useState<ExperienceTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="add-experience-button"]',
        content: 'Click this button to add a new work experience entry. You can add multiple positions at different companies. The tour will automatically click this for you to show the form.',
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

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    if (type === 'step:after' && action === 'next') {
      // Special handling for the first step - automatically click the add experience button
      if (index === 0) {
        const addButton = document.querySelector('[data-tour="add-experience-button"]') as HTMLButtonElement;
        if (addButton) {
          addButton.click();
          
          // End this tour and start the form tour
          setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
          
          // Wait a bit for the form to render, then start the form tour
          setTimeout(() => {
            onStartFormTour?.();
          }, 500);
        }
      } else {
        // For other steps, advance normally
        setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
      }
    }
  }, [onStartFormTour]);

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
