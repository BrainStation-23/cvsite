
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

interface EmployeeProfile {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

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

  const displayValue = selectedProfile 
    ? `${selectedProfile.first_name} ${selectedProfile.last_name} (${selectedProfile.employee_id})`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="truncate">{displayValue}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search employees..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading employees..." : "No employee found."}
            </CommandEmpty>
            <CommandGroup>
              {profiles.map((profile) => (
                <CommandItem
                  key={profile.id}
                  value={`${profile.first_name} ${profile.last_name} ${profile.employee_id}`}
                  onSelect={() => {
                    onValueChange(profile.id === value ? "" : profile.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === profile.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ID: {profile.employee_id}
                    </span>
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
