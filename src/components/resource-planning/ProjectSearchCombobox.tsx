import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, ChevronsUpDown, X, Sparkles, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreateProjectForm } from './CreateProjectForm';

interface ProjectSearchComboboxProps {
  value: string | null;
  onValueChange: (value: string | null, projectData?: any) => void;
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
  const [createMode, setCreateMode] = useState(false);
  
  // Fetch selected project separately to ensure it's always available
  const { data: selectedProject } = useQuery({
    queryKey: ['selected-project', value],
    queryFn: async () => {
      if (!value) return null;
      
      const { data, error } = await supabase
        .from('projects_management')
        .select(`
          id, 
          project_name, 
          client_name, 
          project_level, 
          project_bill_type, 
          project_type:project_types(name)
        `)
        .eq('id', value)
        .single();
      
      if (error) throw error;
      return {
        ...data,
        project_type_name: data.project_type?.name || null
      };
    },
    enabled: !!value,
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects-search', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('projects_management')
        .select(`
          id, 
          project_name, 
          client_name, 
          project_level, 
          project_bill_type, 
          project_type:project_types(name)
        `)
        .eq('is_active', true)
        .order('project_name', { ascending: true });

      if (searchQuery) {
        query = query.or(`project_name.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return (data || []).map(project => ({
        ...project,
        project_type_name: project.project_type?.name || null
      }));
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
      const selectedProjectData = allProjects.find(p => p.id === projectId);
      onValueChange(projectId, selectedProjectData);
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
      setCreateMode(false);
    }
  };

  const handleCreateNew = () => {
    setCreateMode(true);
  };

  const handleBackToSearch = () => {
    setCreateMode(false);
  };

  const handleProjectCreated = (projectId: string, projectData: any) => {
    onValueChange(projectId, projectData);
    setOpen(false);
    setCreateMode(false);
  };

  // Check if search query matches existing projects
  const hasExactMatch = allProjects.some(project => 
    project.project_name.toLowerCase() === searchQuery.toLowerCase()
  );

  const shouldShowCreateOption = searchQuery.trim() && !hasExactMatch && !createMode;

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
              <span
                className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                onClick={handleClear}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onValueChange(null);
                  }
                }}
                aria-label="Clear selection"
                role="button"
                tabIndex={0}
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 max-h-[400px]">
        {createMode ? (
          <CreateProjectForm
            initialProjectName={searchQuery}
            onProjectCreated={handleProjectCreated}
            onCancel={handleBackToSearch}
          />
        ) : (
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
              
              {shouldShowCreateOption && (
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreateNew}
                    className="py-3 text-primary cursor-pointer border-b"
                  >
                    <Plus className="mr-2 h-4 w-4 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">Create New Forecasted Project</span>
                      <span className="text-xs text-muted-foreground">"{searchQuery}"</span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              )}
              
              {shouldShowCreateOption && allProjects.length > 0 && (
                <Separator className="my-1" />
              )}

              <CommandGroup>
                {allProjects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={project.id}
                    onSelect={() => handleSelect(project.id)}
                    className="py-3"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === project.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col w-full min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{project.project_name}</span>
                      </div>
                      {project.client_name && (
                        <span className="text-sm text-muted-foreground mb-2 truncate">Client: {project.client_name}</span>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {project.project_level && (
                          <Badge variant="secondary" className="text-xs">
                            Level: {project.project_level}
                          </Badge>
                        )}
                        {project.project_bill_type && (
                          <Badge variant="secondary" className="text-xs">
                            Bill: {project.project_bill_type}
                          </Badge>
                        )}
                        {project.project_type_name && (
                          <Badge variant="secondary" className="text-xs">
                            Type: {project.project_type_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ProjectSearchCombobox;