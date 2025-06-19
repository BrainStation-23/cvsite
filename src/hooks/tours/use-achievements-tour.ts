

import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface AchievementsTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

export const useAchievementsTour = () => {
  const [tourState, setTourState] = useState<AchievementsTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="add-achievement-button"]',
        content: 'Click this button to add a new achievement. You can add multiple achievements from different areas of your career.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="achievement-title"]',
        content: 'Enter the title or name of your achievement. Be specific about what you accomplished.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="achievement-date"]',
        content: 'Select the date when you received this achievement. Use the calendar picker to choose the date.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="achievement-description"]',
        content: 'Add a detailed description of your achievement and its significance. Explain the impact and context.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="achievement-save-button"]',
        content: 'Click here to save your achievement entry. Make sure all required fields are filled before saving.',
        placement: 'top',
        disableBeacon: true,
      },
    ],
    stepIndex: 0,
  });

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED|| action === 'close') {
      setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    if (type === 'step:after') {
      if (action === 'next') {
        // If we're on the first step (add button), simulate clicking it
        if (index === 0) {
          const addButton = document.querySelector('[data-tour="add-achievement-button"]') as HTMLButtonElement;
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

