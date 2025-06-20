import React from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Education } from '@/types';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface EducationItemProps {
  education: Education;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const EducationItem: React.FC<EducationItemProps> = ({
  education,
  isEditing,
  onEdit,
  onDelete
}) => {
  const {
    isOpen,
    config,
    showConfirmation,
    hideConfirmation,
    handleConfirm
  } = useConfirmationDialog();

  const handleDelete = () => {
    showConfirmation({
      title: 'Delete Education',
      description: 'Are you sure you want to delete this education record? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: onDelete
    });
  };

  return (
    <>
      <AccordionItem value={education.id} className="border rounded-md p-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between pr-4">
            <div className="font-medium">
              {education.degree} {education.department ? `- ${education.department}` : ''}
            </div>
            <div className="text-muted-foreground text-sm mt-1 md:mt-0">
              {format(education.startDate, 'MMM yyyy')} - {
                education.isCurrent 
                  ? 'Present' 
                  : education.endDate 
                    ? format(education.endDate, 'MMM yyyy') 
                    : ''
              }
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mt-2 space-y-4">
            <div>
              <div className="font-medium">{education.university}</div>
              {education.gpa && (
                <div className="text-sm text-muted-foreground mt-1">
                  GPA: {education.gpa}
                </div>
              )}
            </div>
            
            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config?.title || ''}
        description={config?.description || ''}
        confirmText={config?.confirmText}
        cancelText={config?.cancelText}
        variant={config?.variant}
      />
    </>
  );
};
