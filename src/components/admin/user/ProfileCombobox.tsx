
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
  
  console.log('=== ProfileCombobox Debug ===');
  console.log('Current value prop:', value);
  console.log('Label:', label);
  console.log('Disabled:', disabled);

  // Fetch selected profile separately to ensure it's always available
  const { data: selectedProfile, isLoading: selectedLoading, error: selectedError } = useQuery({
    queryKey: ['selected-profile', value],
    queryFn: async () => {
      console.log('Fetching selected profile for value:', value);
      if (!value) {
        console.log('No value provided, returning null');
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .eq('id', value)
        .single();
      
      console.log('Selected profile query result:', { data, error });
      
      if (error) {
        console.error('Error fetching selected profile:', error);
        throw error;
      }
      return data;
    },
    enabled: !!value,
  });

  // Fetch profiles for search
  const { data: searchProfiles, isLoading } = useQuery({
    queryKey: ['profiles-search', searchQuery],
    queryFn: async () => {
      console.log('Searching profiles with query:', searchQuery);
      
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .order('first_name', { ascending: true })
        .limit(50);

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,employee_id.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      console.log('Profile search result:', { data, error, searchQuery });
      
      if (error) {
        console.error('Error searching profiles:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  const profiles = searchProfiles || [];
  
  console.log('Search result profiles:', profiles);
  console.log('Selected profile from query:', selectedProfile);
  console.log('Selected profile loading:', selectedLoading);
  console.log('Selected profile error:', selectedError);

  // Combine search results with selected profile to ensure it's always available
  const allProfiles = React.useMemo(() => {
    const combinedProfiles = [...profiles];
    
    // Add selected profile if it's not already in the search results
    if (selectedProfile && !profiles.some(p => p.id === selectedProfile.id)) {
      console.log('Adding selected profile to list:', selectedProfile);
      combinedProfiles.unshift(selectedProfile);
    }
    
    // Remove duplicates based on id
    const uniqueProfiles = combinedProfiles.filter((profile, index, self) => 
      index === self.findIndex(p => p.id === profile.id)
    );
    
    console.log('Final combined profiles:', uniqueProfiles);
    return uniqueProfiles;
  }, [profiles, selectedProfile]);

  const handleSelect = (profileId: string) => {
    console.log('Selecting profile:', profileId, 'current value:', value);
    if (profileId === value) {
      console.log('Deselecting profile');
      onValueChange(null);
    } else {
      console.log('Setting new profile:', profileId);
      onValueChange(profileId);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Clearing profile selection');
    onValueChange(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log('Popover open state changing to:', newOpen);
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  };

  const getDisplayName = (profile: Profile) => {
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    return name || profile.employee_id || 'Unknown';
  };

  console.log('Rendering with selected profile:', selectedProfile);

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
