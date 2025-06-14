
import { useState, useCallback } from 'react';
import { CallBackProps, Step, STATUS } from 'react-joyride';

export interface ProfileTourState {
  run: boolean;
  steps: Step[];
  stepIndex: number;
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
        content: 'Document your work experience to showcase your professional journey.',
        placement: 'bottom',
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

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, type, index } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setTourState(prev => ({ ...prev, run: false, stepIndex: 0 }));
    } else if (type === 'step:after') {
      setTourState(prev => ({ ...prev, stepIndex: index + 1 }));
    }
  }, []);

  const startTour = useCallback(() => {
    setTourState(prev => ({ ...prev, run: true, stepIndex: 0 }));
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
