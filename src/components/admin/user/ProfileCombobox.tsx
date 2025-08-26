
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProfileComboboxProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  employee_id: string | null;
}

export const ProfileCombobox: React.FC<ProfileComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select profile...",
  disabled = false,
  label = "Profile"
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch selected profile separately to ensure it's always available
  const { data: selectedProfile } = useQuery({
    queryKey: ['selected-profile', value],
    queryFn: async () => {
      if (!value) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .eq('id', value)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!value,
  });

  // Fetch profiles for search
  const { data: searchProfiles, isLoading } = useQuery({
    queryKey: ['profiles-search', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .order('first_name', { ascending: true })
        .limit(50);

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,employee_id.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });

  const profiles = searchProfiles || [];

  // Combine search results with selected profile to ensure it's always available
  const allProfiles = React.useMemo(() => {
    const combinedProfiles = [...profiles];
    
    // Add selected profile if it's not already in the search results
    if (selectedProfile && !profiles.some(p => p.id === selectedProfile.id)) {
      combinedProfiles.unshift(selectedProfile);
    }
    
    // Remove duplicates based on id
    const uniqueProfiles = combinedProfiles.filter((profile, index, self) => 
      index === self.findIndex(p => p.id === profile.id)
    );
    
    return uniqueProfiles;
  }, [profiles, selectedProfile]);

  const handleSelect = (profileId: string) => {
    if (profileId === value) {
      onValueChange(null);
    } else {
      onValueChange(profileId);
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

  const getDisplayName = (profile: Profile) => {
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    return name || profile.employee_id || 'Unknown';
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
          {selectedProfile ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{getDisplayName(selectedProfile)}</span>
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
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Search ${label.toLowerCase()}...`}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : `No ${label.toLowerCase()} found.`}
            </CommandEmpty>
            <CommandGroup>
              {allProfiles.map((profile) => (
                <CommandItem
                  key={profile.id}
                  value={profile.id}
                  onSelect={() => handleSelect(profile.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === profile.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{getDisplayName(profile)}</span>
                    {profile.employee_id && (
                      <span className="text-xs text-gray-500">{profile.employee_id}</span>
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
