
import React from 'react';
import { ProfileCombobox } from '@/components/admin/user/ProfileCombobox';

interface ProjectManagerComboboxProps {
  value?: string;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ProjectManagerCombobox: React.FC<ProjectManagerComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select a project manager...",
  disabled = false,
}) => {
  return (
    <ProfileCombobox
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      disabled={disabled}
      label="Project Manager"
    />
  );
};
