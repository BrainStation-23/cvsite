
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
        target: '[data-tour="remove-image-button"]',
        content: 'If you want to remove your current profile image, click the "Remove" button.',
        placement: 'bottom',
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

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    if (type === 'step:after' && action === 'next') {
      const nextStepIndex = index + 1;
      
      if (nextStepIndex < tourState.steps.length) {
        // Wait for the element to be available
        const nextStep = tourState.steps[nextStepIndex];
        const elementFound = await waitForElement(nextStep.target as string, 2000);
        
        if (elementFound) {
          setTourState(prev => ({ 
            ...prev, 
            stepIndex: nextStepIndex
          }));
        } else {
          console.warn(`Tour target ${nextStep.target} not found, skipping to next step`);
          // Skip to the next step if element not found
          setTourState(prev => ({ 
            ...prev, 
            stepIndex: nextStepIndex + 1 
          }));
        }
      } else {
        setTourState(prev => ({ ...prev, stepIndex: nextStepIndex }));
      }
    }
  }, [tourState.steps, waitForElement]);

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
