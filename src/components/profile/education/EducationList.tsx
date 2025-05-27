
import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { EducationItem } from './EducationItem';
import { Education } from '@/types';

interface EducationListProps {
  education: Education[];
  isEditing: boolean;
  onEdit: (education: Education) => void;
  onDelete: (id: string) => void;
}

export const EducationList: React.FC<EducationListProps> = ({
  education,
  isEditing,
  onEdit,
  onDelete
}) => {
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      onDelete(id);
    }
  };

  if (education.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No education history added yet. 
        {isEditing && ' Click "Add Education" to add your educational background.'}
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-4">
      {education.map((edu) => (
        <EducationItem
          key={edu.id}
          education={edu}
          isEditing={isEditing}
          onEdit={() => onEdit(edu)}
          onDelete={() => handleDelete(edu.id)}
        />
      ))}
    </Accordion>
  );
};
