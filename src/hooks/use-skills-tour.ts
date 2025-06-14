
import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface SkillsTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

export const useSkillsTour = () => {
  const [tourState, setTourState] = useState<SkillsTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="technical-skills"]',
        content: 'This section contains your technical skills. These are typically programming languages, frameworks, and tools you use in your work.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="technical-skills"] .border-dashed',
        content: 'Click this button to add a new technical skill. You can search from a database of popular technologies or add custom ones.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="specialized-skills"]',
        content: 'Specialized skills include domain-specific knowledge, soft skills, certifications, and other professional competencies.',
        placement: 'top',
      },
      {
        target: '[data-tour="specialized-skills"] .border-dashed',
        content: 'Use this button to add specialized skills like project management, communication, or industry-specific knowledge.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="skill-item"]:first-of-type',
        content: 'Each skill shows your proficiency level (1-10). You can edit skills by clicking the edit button or delete them using the trash icon.',
        placement: 'right',
      },
      {
        target: '[data-tour="skill-drag-handle"]:first-of-type',
        content: 'Use these drag handles to reorder your skills. The order determines how they appear on your CV and profile.',
        placement: 'left',
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
