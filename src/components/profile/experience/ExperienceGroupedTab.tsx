
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { Experience } from '@/types';
import { ExperienceForm } from './ExperienceForm';
import { ExperienceGroupedList } from './ExperienceGroupedList';
import { ExperienceTourButton } from './ExperienceTourButton';

interface ExperienceGroupedTabProps {
  experience: Experience[];
  isEditing: boolean;
  isSaving: boolean;
  onSave: (experience: Omit<Experience, 'id'>) => Promise<boolean>;
  onUpdate: (id: string, experience: Partial<Experience>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const ExperienceGroupedTab: React.FC<ExperienceGroupedTabProps> = ({
  experience,
  isEditing,
  isSaving,
  onSave,
  onUpdate,
  onDelete
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  const handleStartAddNew = () => {
    setIsAdding(true);
    setEditingExperience(null);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleStartEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingExperience(null);
  };

  const handleSaveNew = async (data: Omit<Experience, 'id'>) => {
    const success = await onSave(data);
    if (success) {
      setIsAdding(false);
    }
    return success;
  };

  const handleSaveEdit = async (data: Omit<Experience, 'id'>) => {
    if (!editingExperience) return false;
    
    const success = await onUpdate(editingExperience.id, data);
    if (success) {
      setEditingExperience(null);
    }
    return success;
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
  };

  const showForm = isAdding || editingExperience;
  const showAddButton = isEditing && !showForm;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle>Experience</CardTitle>
            <ExperienceTourButton />
          </div>
          {showAddButton && (
            <Button variant="outline" onClick={handleStartAddNew} data-tour="add-experience-button">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">
                {editingExperience ? 'Edit Experience' : 'Add New Experience'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={editingExperience ? handleCancelEdit : handleCancelAdd}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ExperienceForm
              initialData={editingExperience || undefined}
              isSaving={isSaving}
              onSave={editingExperience ? handleSaveEdit : handleSaveNew}
              onCancel={editingExperience ? handleCancelEdit : handleCancelAdd}
            />
          </div>
        )}
        
        <div data-tour="experience-empty-state">
          <ExperienceGroupedList
            experience={experience}
            isEditing={isEditing}
            onEdit={handleStartEdit}
            onDelete={handleDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
};
