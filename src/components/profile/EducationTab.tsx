
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { Education } from '@/types';
import { EducationForm } from './education/EducationForm';
import { EducationList } from './education/EducationList';
import { EducationTourButton } from './EducationTourButton';

interface EducationTabProps {
  education: Education[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (education: Omit<Education, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, education: Partial<Education>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const EducationTab: React.FC<EducationTabProps> = ({
  education,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  const handleStartAddNew = () => {
    setIsAdding(true);
    setEditingEducation(null);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleStartEdit = (education: Education) => {
    setEditingEducation(education);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingEducation(null);
  };

  const handleSaveNew = async (data: Omit<Education, 'id'>) => {
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
    return success;
  };

  const handleSaveEdit = async (data: Omit<Education, 'id'>) => {
    if (!editingEducation) return false;
    
    const success = await onUpdate(editingEducation.id, data);
    if (success) {
      setEditingEducation(null);
    }
    return success;
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
  };

  const showForm = isAdding || editingEducation;
  const showAddButton = isEditing && !showForm;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle>Education</CardTitle>
            <EducationTourButton />
          </div>
          {showAddButton && (
            <Button variant="outline" onClick={handleStartAddNew} data-tour="add-education-button">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">
                {editingEducation ? 'Edit Education' : 'Add New Education'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={editingEducation ? handleCancelEdit : handleCancelAdd}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <EducationForm
              initialData={editingEducation || undefined}
              isSaving={isSaving}
              onSave={editingEducation ? handleSaveEdit : handleSaveNew}
              onCancel={editingEducation ? handleCancelEdit : handleCancelAdd}
            />
          </div>
        )}
        
        <div data-tour="education-empty-state">
          <EducationList
            education={education}
            isEditing={isEditing}
            onEdit={handleStartEdit}
            onDelete={handleDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
};
