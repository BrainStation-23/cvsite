
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectSearchComboboxProps {
  value: string;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ProjectSearchCombobox: React.FC<ProjectSearchComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Search projects...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const selectedProject = projects?.find(project => project.project_name === value);

  const handleSelect = (projectName: string) => {
    if (projectName === value) {
      onValueChange(null);
    } else {
      onValueChange(projectName);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          ) : value ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{value}</span>
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
        <Command>
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
              {projects?.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.project_name}
                  onSelect={() => handleSelect(project.project_name)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === project.project_name ? "opacity-100" : "opacity-0"
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
