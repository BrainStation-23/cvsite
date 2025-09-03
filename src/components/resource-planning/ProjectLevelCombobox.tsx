import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectLevelComboboxProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ProjectLevelCombobox: React.FC<ProjectLevelComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select project level...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch distinct project_bill_type values from projects_management table
  const { data: projectLevels, isLoading } = useQuery({
    queryKey: ['project-levels', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('projects_management')
        .select('project_level')
        .not('project_level', 'is', null)
        .order('project_level', { ascending: true });

      if (searchQuery) {
        query = query.ilike('project_level', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Extract unique values and format them
      const uniqueLevels = Array.from(
        new Set(
          data
            .map(item => item.project_level?.trim())
            .filter(Boolean) as string[]
        )
      );
      
      return uniqueLevels;
    },
  });

  const handleSelect = (level: string) => {
    if (level === value) {
      onValueChange(null);
    } else {
      onValueChange(level);
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
          {value ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{value}</span>
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
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search project levels..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No project level found."}
            </CommandEmpty>
            <CommandGroup>
              {projectLevels?.map((level) => (
                <CommandItem
                  key={level}
                  value={level}
                  onSelect={() => handleSelect(level)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === level ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {level}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ProjectLevelCombobox;
