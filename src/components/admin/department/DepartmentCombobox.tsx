
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
import { useDepartmentSearch } from '@/hooks/use-department-search';

interface DepartmentComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DepartmentCombobox: React.FC<DepartmentComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select department...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const { data: searchData, isLoading } = useDepartmentSearch({
    searchQuery,
    page: 1,
    perPage: 50,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Safely access departments with fallback to empty array
  const departments = searchData?.departments || [];

  const selectedDepartment = departments.find(
    (department) => department.name === value
  );

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
          {selectedDepartment ? selectedDepartment.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search departments..."
            value={searchQuery || ''}
            onValueChange={(search) => setSearchQuery(search || null)}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading departments..." : "No department found."}
            </CommandEmpty>
            <CommandGroup>
              {departments.map((department) => (
                <CommandItem
                  key={department.id}
                  value={department.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === department.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {department.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
