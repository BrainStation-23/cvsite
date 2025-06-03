
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
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
import { EmployeeProfile } from '@/hooks/types/employee-profiles';
import { useEmployeeProfiles } from '@/hooks/use-employee-profiles';

interface EmployeeComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const EmployeeCombobox: React.FC<EmployeeComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select employee...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    profiles, 
    isLoading, 
    fetchProfiles 
  } = useEmployeeProfiles({ 
    initialPage: 1, 
    initialPerPage: 50 // Get more results for combobox
  });

  // Fetch initial profiles when component mounts
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      fetchProfiles({ 
        page: 1, 
        search: searchQuery,
        perPage: 50 // Get up to 50 results for search
      });
    } else {
      fetchProfiles({ 
        page: 1, 
        search: '',
        perPage: 50 
      });
    }
  }, [searchQuery]);

  const selectedProfile = profiles.find(profile => profile.id === value);

  const getDisplayValue = () => {
    if (!selectedProfile) return placeholder;
    
    const firstName = selectedProfile.first_name || '';
    const lastName = selectedProfile.last_name || '';
    const employeeId = selectedProfile.employee_id;
    
    let displayText = `${firstName} ${lastName}`.trim();
    if (employeeId) {
      displayText += ` (${employeeId})`;
    }
    
    return displayText;
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-w-0"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate text-left">
              {getDisplayValue()}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search employees..." 
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading employees..." : "No employee found."}
            </CommandEmpty>
            <CommandGroup>
              {profiles.map((profile) => {
                const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
                
                return (
                  <CommandItem
                    key={profile.id}
                    value={profile.id}
                    onSelect={() => {
                      onValueChange(profile.id === value ? "" : profile.id);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        value === profile.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">
                        {displayName || 'Unnamed Employee'}
                      </span>
                      {profile.employee_id && (
                        <span className="text-sm text-gray-500 truncate">
                          ID: {profile.employee_id}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
