import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS, EVENTS, ACTIONS } from 'react-joyride';

export interface ProjectsTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
}

const steps: Step[] = [
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
    content: 'Click here to save your project entry and close the form. Make sure all required fields are filled before saving.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '[data-testid="drag-handle"]',
    content: 'Use this drag handle to reorder your projects. Simply drag and drop to change the order in which they appear on your profile.',
    placement: 'right',
    disableBeacon: true,
  },
];

export const useProjectsTour = () => {
  const [tourState, setTourState] = useState<ProjectsTourState>({
    run: false,
    steps,
    stepIndex: 0,
  });

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index, action } = data;
    // Debug
    // @ts-ignore
    if (process.env.NODE_ENV === 'development') console.log("Joyride callback", data);

    // Tour finished
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
      return;
    }

    // Respond to "next" after a step
    if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
      // Step 1 is "Add Project" (index 1): simulate click and go to the next step after wait
      if (index === 1) {
        const addBtn: HTMLButtonElement | null = document.querySelector('[data-tour="add-project-button"]');
        if (addBtn) {
          addBtn.click();
          setTimeout(() => {
            setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
          }, 400);
        } else {
          setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
        }
        return;
      }
      // Step 10: Save Project (index 10) - actually trigger Cancel so tour continues
      if (index === 10) {
        const cancelBtn: HTMLButtonElement | null = Array.from(document.querySelectorAll('button[type="button"]')).find(
          btn => btn.textContent && btn.textContent.trim().toLowerCase() === 'cancel'
        ) || null;
        if (cancelBtn) {
          cancelBtn.click();
          setTimeout(() => {
            setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
          }, 400);
        } else {
          setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
        }
        return;
      }
      // Otherwise just advance to the next step
      setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
    }

    // "Back" handler
    if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
      setTourState(prev => ({ ...prev, stepIndex: Math.max(0, index - 1) }));
    }
    // Re-run on target not found (keeps tour on the same step)
    if (type === EVENTS.TARGET_NOT_FOUND) {
      setTimeout(() => {
        setTourState(prev => ({ ...prev, stepIndex: prev.stepIndex }));
      }, 400);
    }
  }, []);

  const startTour = useCallback(() => {
    setTourState(prev => ({
      ...prev,
      run: true,
      stepIndex: 0,
    }));
  }, []);

  const stopTour = useCallback(() => {
    setTourState(prev => ({
      ...prev,
      run: false,
      stepIndex: 0,
    }));
  }, []);

  return {
    tourState,
    handleJoyrideCallback,
    startTour,
    stopTour,
  };
};
