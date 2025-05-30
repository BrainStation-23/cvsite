
import React, { useState } from 'react';
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

interface EmployeeComboboxProps {
  profiles: EmployeeProfile[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const EmployeeCombobox: React.FC<EmployeeComboboxProps> = ({
  profiles = [],
  value,
  onValueChange,
  placeholder = "Select employee...",
  disabled = false,
  isLoading = false
}) => {
  const [open, setOpen] = useState(false);

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-w-0"
          disabled={disabled || isLoading}
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
        <Command>
          <CommandInput placeholder="Search employees..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading employees..." : "No employee found."}
            </CommandEmpty>
            <CommandGroup>
              {profiles.map((profile) => {
                const searchValue = `${profile.first_name || ''} ${profile.last_name || ''} ${profile.employee_id || ''}`;
                const displayName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
                
                return (
                  <CommandItem
                    key={profile.id}
                    value={searchValue}
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
