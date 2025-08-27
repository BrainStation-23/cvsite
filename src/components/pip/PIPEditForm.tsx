
import React from 'react';
import { PIPInitiationForm } from './PIPInitiationForm';
import { PIP } from '@/types/pip';

interface PIPEditFormProps {
  pipData: PIP;
  onSuccess?: () => void;
}

export const PIPEditForm: React.FC<PIPEditFormProps> = ({
  pipData,
  onSuccess
}) => {
  return (
    <PIPInitiationForm
      initialData={pipData}
      isEditing={true}
      onSuccess={onSuccess}
    />
  );
};
