
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PIPActionButtonsProps {
  isSubmitting: boolean;
  isFormValid: boolean;
  onSubmit: () => void;
  onReset: () => void;
  isEditing?: boolean;
}

export const PIPActionButtons: React.FC<PIPActionButtonsProps> = ({
  isSubmitting,
  isFormValid,
  onSubmit,
  onReset,
  isEditing = false
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !isFormValid}
            className="flex-1"
          >
            {isSubmitting ? (isEditing ? 'Updating PIP...' : 'Creating PIP...') : (isEditing ? 'Update PIP' : 'Create PIP')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="flex-1"
          >
            Reset Form
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
