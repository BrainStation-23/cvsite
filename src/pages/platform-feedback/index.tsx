import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TypeSelector } from './components/TypeSelector';
import { FeedbackForm } from './components/FeedbackForm';
import { FeedbackType } from './types/feedback';

function PlatformFeedback() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);

  const handleViewExisting = () => {
    window.open('https://github.com/BrainStation-23/cvsite/issues', '_blank');
  };

  return (
    <div className="mx-auto h-[88vh]">
      <Card className='border-none shadow-none'>
        <CardContent className="border-none">
          {!feedbackType ? (
            <TypeSelector onSelectType={setFeedbackType} onViewExisting={handleViewExisting} />
          ) : (
            <FeedbackForm
              type={feedbackType}
              onBack={() => setFeedbackType(null)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PlatformFeedback;
