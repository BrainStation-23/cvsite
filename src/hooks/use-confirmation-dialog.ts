
import { useState } from 'react';

interface ConfirmationConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
}

export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmationConfig | null>(null);

  const showConfirmation = (confirmationConfig: ConfirmationConfig) => {
    setConfig(confirmationConfig);
    setIsOpen(true);
  };

  const hideConfirmation = () => {
    setIsOpen(false);
    setConfig(null);
  };

  const handleConfirm = () => {
    if (config) {
      config.onConfirm();
    }
    hideConfirmation();
  };

  return {
    isOpen,
    config,
    showConfirmation,
    hideConfirmation,
    handleConfirm
  };
};
