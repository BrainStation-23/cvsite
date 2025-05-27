
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
import { useDesignationSearch } from '@/hooks/use-designation-search';

interface DesignationComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DesignationCombobox: React.FC<DesignationComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select designation...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const { data: searchData, isLoading } = useDesignationSearch({
    searchQuery,
    page: 1,
    perPage: 50, // Get more results for dropdown
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const designations = searchData?.designations || [];

  const selectedDesignation = designations.find(
    (designation) => designation.name === value
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
          {selectedDesignation ? selectedDesignation.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search designations..."
            value={searchQuery || ''}
            onValueChange={(search) => setSearchQuery(search || null)}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading designations..." : "No designation found."}
            </CommandEmpty>
            <CommandGroup>
              {designations.map((designation) => (
                <CommandItem
                  key={designation.id}
                  value={designation.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === designation.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {designation.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
