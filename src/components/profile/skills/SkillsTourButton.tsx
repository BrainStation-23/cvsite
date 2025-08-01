import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import Joyride from 'react-joyride';
import { useSkillsTour } from '@/hooks/tours/use-skills-tour';

export const SkillsTourButton: React.FC = () => {
  const { tourState, handleJoyrideCallback, startTour } = useSkillsTour();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={startTour}
        className="h-8 w-8 p-0"
        title="Start Skills Tour"
      >
        <Info className="h-4 w-4" />
      </Button>
      
      <Joyride
        steps={tourState.steps}
        run={tourState.run}
        stepIndex={tourState.stepIndex}
        callback={handleJoyrideCallback}
        continuous={true}
        showProgress={true}
        styles={{
          options: {
            primaryColor: '#0ea5e9',
            textColor: '#374151',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            arrowColor: '#ffffff',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '8px',
            fontSize: '14px',
          },
          buttonNext: {
            backgroundColor: '#0ea5e9',
            fontSize: '14px',
            padding: '8px 16px',
          },
          buttonBack: {
            color: '#6b7280',
            fontSize: '14px',
            padding: '8px 16px',
          },
          buttonSkip: {
            color: '#6b7280',
            fontSize: '14px',
          },
        }}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </>
  );
};
