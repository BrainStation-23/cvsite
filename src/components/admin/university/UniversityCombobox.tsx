
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
  compact?: boolean; // New prop for consistent sizing
}

export const UniversityCombobox: React.FC<UniversityComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select university...",
  disabled = false,
  compact = false
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

  const buttonClasses = compact 
    ? "w-full justify-between text-xs h-7"
    : "w-full justify-between";

  const iconClasses = compact 
    ? "ml-2 h-3 w-3 shrink-0 opacity-50"
    : "ml-2 h-4 w-4 shrink-0 opacity-50";

  const inputClasses = compact ? "h-8" : "";
  const itemClasses = compact ? "text-xs" : "";
  const checkClasses = compact ? "mr-2 h-3 w-3" : "mr-2 h-4 w-4";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={buttonClasses}
          disabled={disabled}
        >
          {selectedUniversity ? selectedUniversity.name : placeholder}
          <ChevronsUpDown className={iconClasses} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search universities..."
            value={searchQuery || ''}
            onValueChange={(search) => setSearchQuery(search || null)}
            className={inputClasses}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading universities..." : "No university found."}
            </CommandEmpty>
            <CommandGroup>
              {universities.filter(university => university.name && university.name.trim() !== '').map((university) => (
                <CommandItem
                  key={university.id}
                  value={university.name}
                  onSelect={(currentValue) => {
                    if (currentValue === value) {
                      onValueChange('');
                    } else {
                      onValueChange(currentValue);
                    }
                    setOpen(false);
                  }}
                  className={itemClasses}
                >
                  <Check
                    className={cn(
                      checkClasses,
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
