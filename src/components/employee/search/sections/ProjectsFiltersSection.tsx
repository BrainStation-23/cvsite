
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TechnologyTagsInput from '../TechnologyTagsInput';

interface ProjectsFiltersSectionProps {
  projectNameInput: string;
  projectDescriptionInput: string;
  technologyInput: string[];
  achievementInput: string;
  onProjectNameChange: (value: string) => void;
  onProjectDescriptionChange: (value: string) => void;
  onTechnologyChange: (technologies: string[]) => void;
  onAchievementChange: (value: string) => void;
  isLoading: boolean;
}

const ProjectsFiltersSection: React.FC<ProjectsFiltersSectionProps> = ({
  projectNameInput,
  projectDescriptionInput,
  technologyInput,
  achievementInput,
  onProjectNameChange,
  onProjectDescriptionChange,
  onTechnologyChange,
  onAchievementChange,
  isLoading
}) => {
  return (
    <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          Projects & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">Project Name</Label>
            <Input
              placeholder="Project name..."
              value={projectNameInput}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="text-xs h-7 w-full"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">Project Description</Label>
            <Input
              placeholder="Project description..."
              value={projectDescriptionInput}
              onChange={(e) => onProjectDescriptionChange(e.target.value)}
              className="text-xs h-7 w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">Technologies</Label>
          <TechnologyTagsInput
            value={technologyInput}
            onChange={onTechnologyChange}
            placeholder="Add technologies..."
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium text-purple-700 dark:text-purple-300">Achievement</Label>
          <Input
            placeholder="Search achievements..."
            value={achievementInput}
            onChange={(e) => onAchievementChange(e.target.value)}
            className="text-xs h-7 w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsFiltersSection;
