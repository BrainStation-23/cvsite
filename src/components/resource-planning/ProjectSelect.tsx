
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  project_name: string;
}

interface ProjectSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ProjectSelect: React.FC<ProjectSelectProps> = ({
  value,
  onChange,
  placeholder = "Select project...",
  disabled = false,
}) => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_name')
        .order('project_name', { ascending: true });
      
      if (error) throw error;
      return data as Project[];
    },
  });

  return (
    <Select value={value || ''} onValueChange={(val) => onChange(val || null)} disabled={disabled || isLoading}>
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">None</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.project_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
