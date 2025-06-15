
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
        content: 'Click this button to add a new work experience entry. You can add multiple positions at different companies. The tour will automatically click this for you to show the form.',
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
    const { status, type, index, action, step } = data;

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
          
          // Use a more robust approach to wait for the form
          const waitForForm = (attempts: number = 0) => {
            const form = document.querySelector('[data-tour="experience-form"]');
            if (form) {
              // Form found, advance to next step
              setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
            } else if (attempts < 10) {
              // Try again after a short delay, up to 10 attempts (3 seconds total)
              setTimeout(() => waitForForm(attempts + 1), 300);
            } else {
              // Fallback: advance anyway after timeout
              setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
            }
          };
          
          // Start waiting for the form
          waitForForm();
        } else {
          // If button not found, just advance
          setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
        }
      } else {
        // For other steps, advance normally
        setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
      }
    }

    // Handle step skipping - if we're trying to show a step but the target doesn't exist, skip it
    if (type === 'tooltip' && step?.target) {
      const targetElement = document.querySelector(step.target as string);
      if (!targetElement && index > 0) {
        // Skip this step if target doesn't exist (except for the first step)
        setTimeout(() => {
          setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
        }, 100);
      }
    }

    // Handle cases where joyride can't find the target
    if (status === STATUS.ERROR) {
      // Skip to next step on error
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
