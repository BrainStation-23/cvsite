
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectSearchComboboxProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ProjectSearchCombobox: React.FC<ProjectSearchComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select project...",
  disabled = false
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
      return data;
    },
    enabled: !!value,
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects-search', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('projects_management')
        .select('id, project_name, client_name')
        .eq('is_active', true)
        .order('project_name', { ascending: true });

      if (searchQuery) {
        query = query.or(`project_name.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // Combine search results with selected project to ensure it's always available
  const allProjects = React.useMemo(() => {
    const combinedProjects = [...(projects || [])];
    
    // Add selected project if it's not already in the search results
    if (selectedProject && !projects?.some(p => p.id === selectedProject.id)) {
      combinedProjects.unshift(selectedProject);
    }
    
    // Remove duplicates based on id
    const uniqueProjects = combinedProjects.filter((project, index, self) => 
      index === self.findIndex(p => p.id === project.id)
    );
    
    return uniqueProjects;
  }, [projects, selectedProject]);

  const handleSelect = (projectId: string) => {
    if (projectId === value) {
      onValueChange(null);
    } else {
      onValueChange(projectId);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
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
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{selectedProject.project_name}</span>
              <X 
                className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100" 
                onClick={handleClear}
              />
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search projects..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No project found."}
            </CommandEmpty>
            <CommandGroup>
              {allProjects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.id}
                  onSelect={() => handleSelect(project.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === project.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{project.project_name}</span>
                    {project.client_name && (
                      <span className="text-sm text-muted-foreground">{project.client_name}</span>
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

export default ProjectSearchCombobox;
