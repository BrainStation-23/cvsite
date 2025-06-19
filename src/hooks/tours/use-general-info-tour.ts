import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface GeneralInfoTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

export const useGeneralInfoTour = () => {
  const [tourState, setTourState] = useState<GeneralInfoTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="profile-image"]',
        content: 'Upload a professional profile picture here. Click the camera icon to add a new image, or use the "Upload Image" button below.',
        placement: 'right',
        disableBeacon: true,
      },
      {
        target: '[data-tour="first-name-input"]',
        content: 'Enter your first name here. This field is required for your profile.',
        placement: 'top',
      },
      {
        target: '[data-tour="last-name-input"]',
        content: 'Enter your last name here. This field is also required.',
        placement: 'top',
      },
      {
        target: '[data-tour="designation-select"]',
        content: 'Select your current job designation. You can choose from existing options or add a new one.',
        placement: 'top',
      },
      {
        target: '[data-tour="biography"]',
        content: 'Write a compelling biography that highlights your professional background and key achievements. This helps others understand your expertise.',
        placement: 'top',
      },
    ],
    stepIndex: 0,
  });

  const waitForElement = useCallback((selector: string, timeout = 3000): Promise<boolean> => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(true);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(true);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(false);
      }, timeout);
    });
  }, []);

  const handleJoyrideCallback = useCallback(async (data: CallBackProps) => {
    const { status, type, index, action } = data;

    // Handle tour close
    if (
      status === STATUS.FINISHED || 
      status === STATUS.SKIPPED || 
      status === STATUS.PAUSED ||
      action === 'close'
    ) {
      setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    if (type === 'step:after' && action === 'next') {
      // Joyride already increments step index, so use current index
      const nextStepIndex = index;
      
      if (nextStepIndex < tourState.steps.length - 1) {
        // Wait for next target element
        const nextStep = tourState.steps[nextStepIndex + 1];
        const elementFound = await waitForElement(nextStep.target as string, 2000);
        
        if (elementFound) {
          setTourState(prev => ({
            ...prev,
            stepIndex: nextStepIndex + 1
          }));
        } else {
          console.warn(`Tour target ${nextStep.target} not found, skipping step`);
          // Skip to next step if target not found
          setTourState(prev => ({
            ...prev,
            stepIndex: nextStepIndex + 1
          }));
        }
      }
    }
  }, [tourState.steps.length, waitForElement]);

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
