
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check, ChevronsUpDown, X, Sparkles, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedProjectsApiService } from '@/services/enhanced-projects-api';
import { ProjectTypeCombobox } from '@/components/projects/ProjectTypeCombobox';
import ProjectBillTypeCombobox from '@/components/resource-planning/ProjectBillTypeCombobox';
import ProjectLevelCombobox from '@/components/resource-planning/ProjectLevelCombobox';
import { useToast } from '@/hooks/use-toast';

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
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state for new project creation
  const [newProjectForm, setNewProjectForm] = useState({
    project_name: '',
    project_level: null as string | null,
    project_bill_type: null as string | null,
    project_type: null as string | null,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
          forecasted,
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
          forecasted,
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
      setNewProjectForm({
        project_name: '',
        project_level: null,
        project_bill_type: null,
        project_type: null,
      });
    }
  };

  const handleCreateNew = () => {
    setCreateMode(true);
    setNewProjectForm(prev => ({
      ...prev,
      project_name: searchQuery
    }));
  };

  const handleBackToSearch = () => {
    setCreateMode(false);
    setNewProjectForm({
      project_name: '',
      project_level: null,
      project_bill_type: null,
      project_type: null,
    });
  };

  const handleCreateProject = async () => {
    if (!newProjectForm.project_name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive'
      });
      return;
    }

    if (!newProjectForm.project_level || !newProjectForm.project_bill_type || !newProjectForm.project_type) {
      toast({
        title: 'Error', 
        description: 'Project level, bill type, and type are required',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);

    try {
      const projectData = {
        project_name: newProjectForm.project_name.trim(),
        project_level: newProjectForm.project_level,
        project_bill_type: newProjectForm.project_bill_type,
        project_type: newProjectForm.project_type,
        forecasted: true,
        is_active: true,
        client_name: null,
        project_manager: null,
        budget: null,
        description: null,
      };

      await EnhancedProjectsApiService.createProject(projectData);

      // Refresh project lists
      await queryClient.invalidateQueries({ queryKey: ['projects-search'] });
      await queryClient.invalidateQueries({ queryKey: ['selected-project'] });

      // Get the newly created project to select it
      const { data: newProjects } = await supabase
        .from('projects_management')
        .select(`
          id, 
          project_name, 
          client_name, 
          project_level, 
          project_bill_type, 
          forecasted,
          project_type:project_types(name)
        `)
        .eq('project_name', projectData.project_name)
        .eq('forecasted', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (newProjects && newProjects.length > 0) {
        const newProject = {
          ...newProjects[0],
          project_type_name: newProjects[0].project_type?.name || null
        };
        onValueChange(newProject.id, newProject);
      }

      toast({
        title: 'Success',
        description: 'Forecasted project created successfully'
      });

      setOpen(false);
      setCreateMode(false);
      setNewProjectForm({
        project_name: '',
        project_level: null,
        project_bill_type: null,
        project_type: null,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
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
          // Create New Project Form
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSearch}
                disabled={isCreating}
                className="p-1 h-6 w-6"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold text-sm">Create New Forecasted Project</h3>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="project-name" className="text-xs">Project Name *</Label>
                <Input
                  id="project-name"
                  value={newProjectForm.project_name}
                  onChange={(e) => setNewProjectForm(prev => ({ ...prev, project_name: e.target.value }))}
                  placeholder="Enter project name"
                  className="h-8 text-sm"
                  disabled={isCreating}
                />
              </div>

              <div>
                <Label htmlFor="project-level" className="text-xs">Project Level *</Label>
                <ProjectLevelCombobox
                  value={newProjectForm.project_level}
                  onValueChange={(value) => setNewProjectForm(prev => ({ ...prev, project_level: value }))}
                  placeholder="Select level"
                  disabled={isCreating}
                />
              </div>

              <div>
                <Label htmlFor="project-bill-type" className="text-xs">Project Bill Type *</Label>
                <ProjectBillTypeCombobox
                  value={newProjectForm.project_bill_type}
                  onValueChange={(value) => setNewProjectForm(prev => ({ ...prev, project_bill_type: value }))}
                  placeholder="Select bill type"
                  disabled={isCreating}
                />
              </div>

              <div>
                <Label htmlFor="project-type" className="text-xs">Project Type *</Label>
                <ProjectTypeCombobox
                  value={newProjectForm.project_type}
                  onValueChange={(value) => setNewProjectForm(prev => ({ ...prev, project_type: value }))}
                  placeholder="Select type"
                  disabled={isCreating}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleBackToSearch}
                variant="outline"
                size="sm"
                disabled={isCreating}
                className="flex-1 h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                size="sm"
                disabled={isCreating || !newProjectForm.project_name.trim() || !newProjectForm.project_level || !newProjectForm.project_bill_type || !newProjectForm.project_type}
                className="flex-1 h-8 text-xs"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Search Mode
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
                        {project.forecasted && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 shrink-0">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Forecasted
                          </Badge>
                        )}
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
