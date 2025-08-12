
import { useState } from 'react';

interface CompleteEngagementConfig {
  title: string;
  description: string;
  currentReleaseDate?: string;
  employeeName: string;
  projectName?: string;
  onConfirm: (newReleaseDate: string) => void;
}

export const useCompleteEngagementDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<CompleteEngagementConfig | null>(null);

  const showCompleteDialog = (completeConfig: CompleteEngagementConfig) => {
    setConfig(completeConfig);
    setIsOpen(true);
  };

  const hideCompleteDialog = () => {
    setIsOpen(false);
    setConfig(null);
  };

  const handleConfirm = (newReleaseDate: string) => {
    if (config) {
      config.onConfirm(newReleaseDate);
    }
    hideCompleteDialog();
  };

  return {
    isOpen,
    config,
    showCompleteDialog,
    hideCompleteDialog,
    handleConfirm
  };
};
