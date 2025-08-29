
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { EnhancedProjectsApiService } from '@/services/enhanced-projects-api';

interface ProjectLevelSelectProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ProjectLevelSelect: React.FC<ProjectLevelSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select project level",
  disabled = false,
}) => {
  const { data: projectLevels, isLoading } = useQuery({
    queryKey: ['project-levels'],
    queryFn: () => EnhancedProjectsApiService.getProjectLevels(),
  });

  const handleValueChange = (newValue: string) => {
    if (newValue === 'all') {
      onValueChange(null);
    } else {
      onValueChange(newValue);
    }
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading levels..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value || 'all'}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Levels</SelectItem>
        {projectLevels?.map((level) => (
          <SelectItem key={level} value={level}>
            {level}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
