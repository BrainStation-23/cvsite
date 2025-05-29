
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { Skill } from '@/types';

interface SkillAddFormProps {
  showAddForm: boolean;
  newSkill: Omit<Skill, 'id'>;
  setNewSkill: (skill: Omit<Skill, 'id'>) => void;
  onAddSkill: () => void;
  onCancel: () => void;
  onShowForm: () => void;
  isEditing: boolean;
}

export const SkillAddForm: React.FC<SkillAddFormProps> = ({
  showAddForm,
  newSkill,
  setNewSkill,
  onAddSkill,
  onCancel,
  onShowForm,
  isEditing
}) => {
  const handleAddSkill = () => {
    onAddSkill();
    setNewSkill({ name: '', proficiency: 1, priority: 0 });
  };

  if (!isEditing) return null;

  if (!showAddForm) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onShowForm}
        className="h-9 text-cvsite-teal border-cvsite-teal hover:bg-cvsite-teal hover:text-white"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Skill
      </Button>
    );
  }

  return (
    <div className="mt-4 p-4 border-2 border-dashed border-cvsite-teal/30 bg-cvsite-teal/5 rounded-lg">
      <div className="space-y-3">
        <Input
          placeholder="Enter skill name"
          value={newSkill.name}
          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
          className="border-cvsite-teal/30 focus:border-cvsite-teal"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Proficiency:</span>
            <div className="flex space-x-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewSkill({ ...newSkill, proficiency: i + 1 })}
                  className={`w-5 h-5 rounded transition-colors ${
                    i < newSkill.proficiency 
                      ? 'bg-cvsite-teal hover:bg-cvsite-teal/80' 
                      : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">{newSkill.proficiency}/10</span>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleAddSkill}
              disabled={!newSkill.name.trim()}
              className="bg-cvsite-teal hover:bg-cvsite-teal/90"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
