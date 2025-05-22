
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Skill } from '@/types';

interface SkillsTabProps {
  technicalSkills: Skill[];
  specializedSkills: Skill[];
  isEditing: boolean;
  newTechnicalSkill: Omit<Skill, 'id'>;
  newSpecializedSkill: Omit<Skill, 'id'>;
  setNewTechnicalSkill: (skill: Omit<Skill, 'id'>) => void;
  setNewSpecializedSkill: (skill: Omit<Skill, 'id'>) => void;
  handleAddTechnicalSkill: () => void;
  handleAddSpecializedSkill: () => void;
  deleteTechnicalSkill: (id: string) => void;
  deleteSpecializedSkill: (id: string) => void;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({
  technicalSkills,
  specializedSkills,
  isEditing,
  newTechnicalSkill,
  newSpecializedSkill,
  setNewTechnicalSkill,
  setNewSpecializedSkill,
  handleAddTechnicalSkill,
  handleAddSpecializedSkill,
  deleteTechnicalSkill,
  deleteSpecializedSkill
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Technical Skills</CardTitle>
          {isEditing && (
            <Button variant="outline" size="sm" className="h-8" 
              onClick={handleAddTechnicalSkill} disabled={!newTechnicalSkill.name}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing && (
            <div className="mb-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder="Skill name"
                  value={newTechnicalSkill.name}
                  onChange={(e) => setNewTechnicalSkill({...newTechnicalSkill, name: e.target.value})}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-sm">Proficiency:</span>
                <div className="flex flex-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewTechnicalSkill({...newTechnicalSkill, proficiency: i + 1})}
                      className={`w-6 h-6 rounded mx-0.5 transition-colors ${
                        i < newTechnicalSkill.proficiency 
                          ? 'bg-cvsite-teal' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {technicalSkills.length > 0 ? (
            <ul className="space-y-2">
              {technicalSkills.map((skill) => (
                <li key={skill.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span>{skill.name}</span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-8 w-8 p-0"
                        onClick={() => deleteTechnicalSkill(skill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-6 h-6 rounded ${
                          i < skill.proficiency 
                            ? 'bg-cvsite-teal' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        } mx-0.5`}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No technical skills added yet.
              {isEditing && ' Fill in the form above to add your skills.'}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Specialized Skills</CardTitle>
          {isEditing && (
            <Button variant="outline" size="sm" className="h-8" 
              onClick={handleAddSpecializedSkill} disabled={!newSpecializedSkill.name}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing && (
            <div className="mb-4 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder="Skill name"
                  value={newSpecializedSkill.name}
                  onChange={(e) => setNewSpecializedSkill({...newSpecializedSkill, name: e.target.value})}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-sm">Proficiency:</span>
                <div className="flex flex-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewSpecializedSkill({...newSpecializedSkill, proficiency: i + 1})}
                      className={`w-6 h-6 rounded mx-0.5 transition-colors ${
                        i < newSpecializedSkill.proficiency 
                          ? 'bg-cvsite-teal' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {specializedSkills.length > 0 ? (
            <ul className="space-y-2">
              {specializedSkills.map((skill) => (
                <li key={skill.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span>{skill.name}</span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-8 w-8 p-0"
                        onClick={() => deleteSpecializedSkill(skill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`w-6 h-6 rounded ${
                          i < skill.proficiency 
                            ? 'bg-cvsite-teal' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        } mx-0.5`}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No specialized skills added yet.
              {isEditing && ' Fill in the form above to add your skills.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
