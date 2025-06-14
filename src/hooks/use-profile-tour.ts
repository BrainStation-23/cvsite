
import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface ProfileTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
  currentTab?: string;
}

export interface TourStep extends Step {
  tab?: string;
}

export const useProfileTour = () => {
  const [tourState, setTourState] = useState<ProfileTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="general-tab"]',
        content: 'Start by filling out your general information. This includes your name, profile picture, and professional biography.',
        placement: 'bottom',
        disableBeacon: true,
        tab: 'general',
      },
      {
        target: '[data-tour="profile-image"]',
        content: 'Upload a professional profile picture. This helps colleagues and clients recognize you.',
        placement: 'right',
        tab: 'general',
      },
      {
        target: '[data-tour="biography"]',
        content: 'Write a compelling biography that highlights your professional background and key achievements.',
        placement: 'top',
        tab: 'general',
      },
      {
        target: '[data-tour="skills-tab"]',
        content: 'Next, add your technical and specialized skills. This helps others understand your expertise.',
        placement: 'bottom',
        tab: 'skills',
      },
      {
        target: '[data-tour="technical-skills"]',
        content: 'Add your technical skills like programming languages, frameworks, and tools you work with.',
        placement: 'right',
        tab: 'skills',
      },
      {
        target: '[data-tour="specialized-skills"]',
        content: 'Include specialized skills that make you unique in your field.',
        placement: 'left',
        tab: 'skills',
      },
      {
        target: '[data-tour="experience-tab"]',
        content: 'Document your work experience to showcase your professional journey.',
        placement: 'bottom',
        tab: 'experience',
      },
      {
        target: '[data-tour="education-tab"]',
        content: 'Add your educational background including degrees, certifications, and relevant coursework.',
        placement: 'bottom',
        tab: 'education',
      },
      {
        target: '[data-tour="training-tab"]',
        content: 'Include any additional training, workshops, or professional development courses.',
        placement: 'bottom',
        tab: 'training',
      },
      {
        target: '[data-tour="achievements-tab"]',
        content: 'Highlight your key achievements, awards, and recognitions.',
        placement: 'bottom',
        tab: 'achievements',
      },
      {
        target: '[data-tour="projects-tab"]',
        content: 'Showcase your notable projects to demonstrate your practical experience.',
        placement: 'bottom',
        tab: 'projects',
      },
      {
        target: '[data-tour="json-tab"]',
        content: 'Finally, you can export your complete profile or import data from existing sources.',
        placement: 'bottom',
        tab: 'json',
      },
    ],
    stepIndex: 0,
  });

  const switchToTab = useCallback((tabValue: string) => {
    const tabTrigger = document.querySelector(`[data-tour="${tabValue}-tab"]`) as HTMLButtonElement;
    if (tabTrigger) {
      tabTrigger.click();
    }
  }, []);

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
      const nextStep = tourState.steps[nextStepIndex] as TourStep;
      
      if (nextStep && nextStep.tab) {
        // Switch to the required tab
        switchToTab(nextStep.tab);
        
        // Wait for the element to be available
        const elementFound = await waitForElement(nextStep.target as string, 2000);
        
        if (elementFound) {
          setTourState(prev => ({ 
            ...prev, 
            stepIndex: nextStepIndex,
            currentTab: nextStep.tab 
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

    if (type === 'step:before') {
      const currentStep = tourState.steps[index] as TourStep;
      
      if (currentStep && currentStep.tab && currentStep.tab !== tourState.currentTab) {
        // Switch to the required tab before showing the step
        switchToTab(currentStep.tab);
        
        // Wait a bit for the tab content to render
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setTourState(prev => ({ 
          ...prev, 
          currentTab: currentStep.tab 
        }));
      }
    }
  }, [tourState.steps, tourState.currentTab, switchToTab, waitForElement]);

  const startTour = useCallback(() => {
    // Start with the general tab
    switchToTab('general');
    setTourState(prev => ({ 
      ...prev, 
      run: true, 
      stepIndex: 0,
      currentTab: 'general'
    }));
  }, [switchToTab]);

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
