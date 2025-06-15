
import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface ProjectsTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

export const useProjectsTour = () => {
  const [tourState, setTourState] = useState<ProjectsTourState>({
    run: false,
    steps: [
      {
        target: '[data-tour="project-search"]',
        content: 'Use this search box to quickly find projects by name, description, or technologies used. Great for filtering through large project lists.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="add-project-button"]',
        content: 'Click this button to add a new project. You can add multiple projects to showcase your work experience and contributions.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="project-name"]',
        content: 'Enter the name of your project. Be specific and descriptive about what the project does or its purpose.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="project-role"]',
        content: 'Specify your role in this project (e.g., Lead Developer, Frontend Developer, Project Manager).',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '[data-tour="project-start-date"]',
        content: 'Select when you started working on this project. Use the calendar picker to choose the date.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="project-end-date"]',
        content: 'Select when the project ended, or check "Current Project" if you\'re still working on it.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="current-project-checkbox"]',
        content: 'Check this box if you\'re currently working on this project. This will disable the end date field.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="project-description"]',
        content: 'Provide a detailed description of the project, your contributions, and the impact. You can use rich text formatting here.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="project-technologies"]',
        content: 'Add the technologies, programming languages, and tools used in this project. Type each technology and click "Add".',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="project-url"]',
        content: 'If available, add a link to the live project, repository, or demo. This is optional but adds credibility.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="project-save-button"]',
        content: 'Click here to save your project entry. Make sure all required fields are filled before saving.',
        placement: 'top',
        disableBeacon: true,
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
      // If we're on the second step (add button), simulate clicking it and wait for form to render
      if (index === 1) {
        const addButton = document.querySelector('[data-tour="add-project-button"]') as HTMLButtonElement;
        if (addButton) {
          addButton.click();
          // Wait a bit for the form to render before proceeding
          setTimeout(() => {
            setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
          }, 300);
          return;
        }
      }
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
