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
import { useRoles } from '@/hooks/rbac/useRoles';

interface CustomRoleComboboxProps {
  value?: string | null;
  onValueChange: (value: string | null) => void;
  onRoleChange?: (roleInfo: { isSbuBound: boolean }) => void;
  placeholder?: string;
  className?: string;
}

const CustomRoleCombobox: React.FC<CustomRoleComboboxProps> = ({
  value,
  onValueChange,
  onRoleChange,
  placeholder = "Select role...",
  className
}) => {
  const [open, setOpen] = useState(false);
  const { data: roles = [], isLoading } = useRoles();

  const selectedRole = roles.find(role => role.id === value);

  const handleSelect = (roleId: string) => {
    const newValue = roleId === value ? null : roleId;
    onValueChange(newValue);
    
    if (newValue && onRoleChange) {
      const selectedRoleInfo = roles.find(role => role.id === newValue);
      onRoleChange({
        isSbuBound: selectedRoleInfo?.is_sbu_bound || false
      });
    } else if (!newValue && onRoleChange) {
      onRoleChange({ isSbuBound: false });
    }
    
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={isLoading}
        >
          {selectedRole ? selectedRole.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search roles..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading roles..." : "No roles found."}
            </CommandEmpty>
            <CommandGroup>
              {roles.map((role) => (
                <CommandItem
                  key={role.id}
                  value={role.id}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === role.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{role.name}</span>
                    {role.description && (
                      <span className="text-xs text-muted-foreground">
                        {role.description}
                      </span>
                    )}
                    {role.is_sbu_bound && (
                      <span className="text-xs text-amber-600">
                        SBU-bound role
                      </span>
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

export default CustomRoleCombobox;