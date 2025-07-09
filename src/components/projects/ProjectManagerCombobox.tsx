
import React, { useState } from 'react';
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

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  employee_id: string | null;
}

interface ProjectManagerComboboxProps {
  value?: string;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ProjectManagerCombobox: React.FC<ProjectManagerComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select a project manager...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['project-managers', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .order('first_name');
      
      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,employee_id.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const selectedProfile = profiles.find(profile => profile.id === value);

  const getDisplayName = (profile: Profile) => {
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    return profile.employee_id ? `${name} (${profile.employee_id})` : name;
  };

  const handleSelect = (profileId: string) => {
    onValueChange(profileId === value ? null : profileId);
    setOpen(false);
    setSearchQuery('');
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
          {selectedProfile ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{getDisplayName(selectedProfile)}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search project managers..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading...' : 'No project managers found.'}
            </CommandEmpty>
            <CommandGroup>
              {profiles.map((profile) => (
                <CommandItem
                  key={profile.id}
                  value={profile.id}
                  onSelect={() => handleSelect(profile.id)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === profile.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{getDisplayName(profile)}</span>
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
