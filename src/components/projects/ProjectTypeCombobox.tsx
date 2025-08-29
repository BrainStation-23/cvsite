
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { EnhancedProjectsApiService } from '@/services/enhanced-projects-api';

interface ProjectTypeComboboxProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ProjectTypeCombobox: React.FC<ProjectTypeComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select project type...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projectTypes, isLoading } = useQuery({
    queryKey: ['project-types'],
    queryFn: () => EnhancedProjectsApiService.getProjectTypes(),
  });

  const selectedType = projectTypes?.find(type => type.id === value);

  const filteredTypes = projectTypes?.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelect = (typeId: string) => {
    if (typeId === value) {
      onValueChange(null);
    } else {
      onValueChange(typeId);
    }
    setOpen(false);
    setSearchQuery('');
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
          {selectedType ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{selectedType.name}</span>
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
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search project types..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading project types...' : 'No project types found.'}
            </CommandEmpty>
            <CommandGroup>
              {filteredTypes.map((type) => (
                <CommandItem
                  key={type.id}
                  value={type.id}
                  onSelect={() => handleSelect(type.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === type.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {type.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
