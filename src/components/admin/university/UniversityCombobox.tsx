
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
import { useUniversitySearch } from '@/hooks/use-university-search';

interface UniversityComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const UniversityCombobox: React.FC<UniversityComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select university...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const { data: searchData, isLoading } = useUniversitySearch({
    searchQuery,
    page: 1,
    perPage: 50,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Safely access universities with fallback to empty array
  const universities = searchData?.universities || [];

  const selectedUniversity = universities.find(
    (university) => university.name === value
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
          {selectedUniversity ? selectedUniversity.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search universities..."
            value={searchQuery || ''}
            onValueChange={(search) => setSearchQuery(search || null)}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading universities..." : "No university found."}
            </CommandEmpty>
            <CommandGroup>
              {universities.map((university) => (
                <CommandItem
                  key={university.id}
                  value={university.name}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === university.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {university.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
