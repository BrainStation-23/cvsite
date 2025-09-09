import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  email: string;
}

interface ProfileMultiSelectProps {
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
}

export const ProfileMultiSelect: React.FC<ProfileMultiSelectProps> = ({
  selectedValues,
  onSelectionChange,
  placeholder = "Select profiles..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles-for-multi-select', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          employee_id,
          email,
          general_information!inner(
            first_name,
            last_name
          )
        `)
        .eq('active', true)
        .order('first_name', { ascending: true });

      if (searchQuery) {
        query = query.or(`
          first_name.ilike.%${searchQuery}%,
          last_name.ilike.%${searchQuery}%,
          employee_id.ilike.%${searchQuery}%,
          email.ilike.%${searchQuery}%,
          general_information.first_name.ilike.%${searchQuery}%,
          general_information.last_name.ilike.%${searchQuery}%
        `);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      
      return (data as any[]).map(profile => ({
        id: profile.id,
        first_name: profile.general_information?.first_name || profile.first_name || '',
        last_name: profile.general_information?.last_name || profile.last_name || '',
        employee_id: profile.employee_id || '',
        email: profile.email || ''
      })).filter(profile => profile.first_name || profile.last_name || profile.employee_id);
    },
  });

  const selectedProfiles = profiles.filter(profile => selectedValues.includes(profile.id));

  const formatProfileName = (profile: Profile) => {
    const name = `${profile.first_name} ${profile.last_name}`.trim();
    return name ? `${name} (${profile.employee_id})` : profile.employee_id || profile.email;
  };

  const handleSelect = (profileId: string) => {
    if (selectedValues.includes(profileId)) {
      onSelectionChange(selectedValues.filter(id => id !== profileId));
    } else {
      onSelectionChange([...selectedValues, profileId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(profiles.map(profile => profile.id));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const removeProfile = (profileId: string) => {
    onSelectionChange(selectedValues.filter(id => id !== profileId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <div className="flex flex-wrap gap-1">
              {selectedValues.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <span className="text-sm">
                  {selectedValues.length} profile{selectedValues.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search by name, employee ID, or email..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No profiles found."}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={handleSelectAll}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Select All</span>
                  </div>
                </CommandItem>
                <CommandItem onSelect={handleClearAll}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Clear All</span>
                  </div>
                </CommandItem>
                {profiles.map((profile) => (
                  <CommandItem
                    key={profile.id}
                    value={profile.id}
                    onSelect={() => handleSelect(profile.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(profile.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{formatProfileName(profile)}</span>
                      {profile.email && (
                        <span className="text-xs text-muted-foreground">{profile.email}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedProfiles.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedProfiles.map((profile) => (
            <Badge key={profile.id} variant="secondary" className="flex items-center gap-1">
              {formatProfileName(profile)}
              <button
                onClick={() => removeProfile(profile.id)}
                className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};