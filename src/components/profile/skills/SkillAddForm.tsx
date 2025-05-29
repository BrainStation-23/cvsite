
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  isEditing
}) => {
  const handleAddSkill = () => {
    onAddSkill();
    setNewSkill({ name: '', proficiency: 1, priority: 0 });
  };

  if (!isEditing || !showAddForm) return null;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <Input
          placeholder="Enter skill name"
          value={newSkill.name}
          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
          className="border-cvsite-teal/30 focus:border-cvsite-teal"
        />
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Proficiency:</span>
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
