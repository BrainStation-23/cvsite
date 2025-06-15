
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
        content: 'This section contains your technical skills like programming languages, frameworks, and tools. You can add, edit, delete, and reorder these skills.',
        placement: 'top',
        disableBeacon: true,
      },
      {
        target: '[data-tour="add-technical-skill"]',
        content: 'Click this button to add a new technical skill. The system will suggest icons for common technologies automatically.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="specialized-skills"]',
        content: 'This section is for specialized skills that make you unique in your field - soft skills, domain expertise, certifications, etc.',
        placement: 'top',
      },
      {
        target: '[data-tour="add-specialized-skill"]',
        content: 'Click this button to add a new specialized skill. These don\'t have automatic icons but are equally important.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="skill-proficiency"]',
        content: 'When adding or editing skills, click on these dots to set your proficiency level from 1 to 10. This helps others understand your expertise level.',
        placement: 'top',
      },
      {
        target: '[data-tour="skill-actions"]',
        content: 'Each skill has action buttons: Save/Cancel when editing, and Delete to remove skills. You can also drag skills to reorder them.',
        placement: 'left',
      },
      {
        target: '[data-tour="drag-handle"]',
        content: 'When in edit mode, you can drag skills by their drag handle to reorder them. This helps you prioritize your most important skills.',
        placement: 'right',
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
      const nextStepIndex = index + 1;
      setTourState(prev => ({ ...prev, stepIndex: nextStepIndex }));
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
