
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
import { useDegreeSearch } from '@/hooks/use-degree-search';

interface DegreeComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DegreeCombobox: React.FC<DegreeComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select degree...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const { data: searchData, isLoading } = useDegreeSearch({
    searchQuery,
    page: 1,
    perPage: 50,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Safely access degrees with fallback to empty array
  const degrees = searchData?.degrees || [];

  const selectedDegree = degrees.find(
    (degree) => degree.name === value
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
          {selectedDegree ? selectedDegree.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search degrees..."
            value={searchQuery || ''}
            onValueChange={(search) => setSearchQuery(search || null)}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading degrees..." : "No degree found."}
            </CommandEmpty>
            <CommandGroup>
              {degrees.map((degree) => (
                <CommandItem
                  key={degree.id}
                  value={degree.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === degree.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {degree.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
