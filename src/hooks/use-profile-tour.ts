
import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface ProfileTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
  currentTab?: string;
}

// Separate mapping for step tabs to avoid TypeScript conflicts
const stepTabMapping: Record<number, string> = {
  0: 'general', // general-tab
  1: 'general', // profile-image  
  2: 'general', // biography
  3: 'skills',  // skills-tab
  4: 'skills',  // technical-skills
  5: 'skills',  // specialized-skills
  6: 'experience', // experience-tab
  7: 'experience', // add-experience-button
  8: 'experience', // experience-company
  9: 'experience', // experience-designation
  10: 'experience', // experience-start-date
  11: 'experience', // experience-end-date
  12: 'experience', // experience-current-checkbox
  13: 'experience', // experience-description
  14: 'experience', // experience-save-button
  15: 'education', // education-tab
  16: 'training', // training-tab
  17: 'achievements', // achievements-tab
  18: 'projects', // projects-tab
  19: 'json', // json-tab
};

export const useProfileTour = () => {
  const [tourState, setTourState] = useState<ProfileTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="general-tab"]',
        content: 'Start by filling out your general information. This includes your name, profile picture, and professional biography.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="profile-image"]',
        content: 'Upload a professional profile picture. This helps colleagues and clients recognize you.',
        placement: 'right',
      },
      {
        target: '[data-tour="biography"]',
        content: 'Write a compelling biography that highlights your professional background and key achievements.',
        placement: 'top',
      },
      {
        target: '[data-tour="skills-tab"]',
        content: 'Next, add your technical and specialized skills. This helps others understand your expertise.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="technical-skills"]',
        content: 'Add your technical skills like programming languages, frameworks, and tools you work with.',
        placement: 'right',
      },
      {
        target: '[data-tour="specialized-skills"]',
        content: 'Include specialized skills that make you unique in your field.',
        placement: 'left',
      },
      {
        target: '[data-tour="experience-tab"]',
        content: 'Now let\'s add your work experience. This section showcases your professional journey and career progression.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="add-experience-button"]',
        content: 'Click "Add Experience" to start adding your work history. Let\'s add your first experience entry!',
        placement: 'left',
      },
      {
        target: '[data-tour="experience-company"]',
        content: 'Enter the company name where you worked. Be sure to use the full, official company name.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-designation"]',
        content: 'Select or enter your job title/designation. You can choose from existing designations or add a new one.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-start-date"]',
        content: 'Set the start date of your employment. Click to open the date picker.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-end-date"]',
        content: 'Set the end date of your employment. If this is your current job, you can check "Current Position" instead.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-current-checkbox"]',
        content: 'Check this box if this is your current position. This will automatically clear the end date.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-description"]',
        content: 'Describe your role, responsibilities, and key achievements. Use bullet points for better readability.',
        placement: 'top',
      },
      {
        target: '[data-tour="experience-save-button"]',
        content: 'Click "Save Experience" to add this entry to your profile. You can add more experiences or edit existing ones later.',
        placement: 'top',
      },
      {
        target: '[data-tour="education-tab"]',
        content: 'Add your educational background including degrees, certifications, and relevant coursework.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="training-tab"]',
        content: 'Include any additional training, workshops, or professional development courses.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="achievements-tab"]',
        content: 'Highlight your key achievements, awards, and recognitions.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="projects-tab"]',
        content: 'Showcase your notable projects to demonstrate your practical experience.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="json-tab"]',
        content: 'Finally, you can export your complete profile or import data from existing sources.',
        placement: 'bottom',
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

    // Special handling for the "Add Experience" button click
    if (type === 'step:after' && action === 'next' && index === 7) {
      // Click the add experience button
      const addButton = document.querySelector('[data-tour="add-experience-button"]') as HTMLButtonElement;
      if (addButton) {
        addButton.click();
        
        // Wait for the form to appear
        const formAppeared = await waitForElement('[data-tour="experience-form"]', 3000);
        
        if (formAppeared) {
          setTourState(prev => ({ 
            ...prev, 
            stepIndex: index + 1,
            currentTab: 'experience'
          }));
        } else {
          console.warn('Experience form did not appear, skipping form steps');
          // Skip to education tab
          setTourState(prev => ({ 
            ...prev, 
            stepIndex: 15
          }));
        }
        return;
      }
    }

    if (type === 'step:after' && action === 'next') {
      const nextStepIndex = index + 1;
      const nextStepTab = stepTabMapping[nextStepIndex];
      
      if (nextStepTab && nextStepIndex < tourState.steps.length) {
        // Switch to the required tab
        switchToTab(nextStepTab);
        
        // Wait for the element to be available
        const nextStep = tourState.steps[nextStepIndex];
        const elementFound = await waitForElement(nextStep.target as string, 2000);
        
        if (elementFound) {
          setTourState(prev => ({ 
            ...prev, 
            stepIndex: nextStepIndex,
            currentTab: nextStepTab 
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
      const currentStepTab = stepTabMapping[index];
      
      if (currentStepTab && currentStepTab !== tourState.currentTab) {
        // Switch to the required tab before showing the step
        switchToTab(currentStepTab);
        
        // Wait a bit for the tab content to render
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setTourState(prev => ({ 
          ...prev, 
          currentTab: currentStepTab 
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
