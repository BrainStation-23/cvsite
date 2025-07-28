
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  project_name: string;
  client_name: string | null;
}

interface ProjectComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ProjectCombobox: React.FC<ProjectComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select a project...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch selected project separately to ensure it's always available
  const { data: selectedProject } = useQuery({
    queryKey: ['selected-project', value],
    queryFn: async () => {
      if (!value) return null;
      
      const { data, error } = await supabase
        .from('projects_management')
        .select('id, project_name, client_name')
        .eq('id', value)
        .single();
      
      if (error) throw error;
      return data as Project;
    },
    enabled: !!value,
  });

  // Smart search query that fetches based on search input
  const { data: searchProjects, isLoading } = useQuery({
    queryKey: ['projects-search', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('projects_management')
        .select('id, project_name, client_name')
        .order('project_name', { ascending: true })
        .limit(50);
      
      if (searchQuery.trim()) {
        query = query.or(`project_name.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Project[];
    },
  });

  const projects = searchProjects || [];

  // Combine search results with selected project to ensure it's always available
  const allProjects = React.useMemo(() => {
    const combinedProjects = [...projects];
    
    // Add selected project if it's not already in the search results
    if (selectedProject && !projects.some(p => p.id === selectedProject.id)) {
      combinedProjects.unshift(selectedProject);
    }
    
    // Remove duplicates based on id
    const uniqueProjects = combinedProjects.filter((project, index, self) => 
      index === self.findIndex(p => p.id === project.id)
    );
    
    return uniqueProjects;
  }, [projects, selectedProject]);

  // Fetch initial projects when component mounts
  useEffect(() => {
    if (!searchQuery.trim()) {
      // This will trigger the query to fetch initial projects
      setSearchQuery('');
    }
  }, []);

  const handleSelect = (projectId: string) => {
    onValueChange(projectId === value ? '' : projectId);
    setOpen(false);
    setSearchQuery('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedProject ? (
            <span className="truncate">
              {selectedProject.project_name}
              {selectedProject.client_name && (
                <span className="text-muted-foreground ml-2">
                  - {selectedProject.client_name}
                </span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search projects..."
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading projects...' : 'No projects found.'}
            </CommandEmpty>
            <CommandGroup>
              {allProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.id}
                  onSelect={() => handleSelect(project.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === project.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{project.project_name}</span>
                    {project.client_name && (
                      <span className="text-sm text-muted-foreground">
                        Client: {project.client_name}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
