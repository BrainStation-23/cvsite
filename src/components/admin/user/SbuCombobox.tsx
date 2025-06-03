
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSbuSearch } from '@/hooks/use-sbu-search';

interface SbuComboboxProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SbuCombobox: React.FC<SbuComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select SBU...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: searchResult, isLoading } = useSbuSearch({
    searchQuery: searchQuery || null,
    page: 1,
    perPage: 50
  });

  const sbus = searchResult?.sbus || [];
  const selectedSbu = sbus.find(sbu => sbu.id === value);

  const handleSelect = (sbuId: string) => {
    if (sbuId === value) {
      onValueChange(null);
    } else {
      onValueChange(sbuId);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(null);
  };

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
          {selectedSbu ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{selectedSbu.name}</span>
              <X 
                className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100" 
                onClick={handleClear}
              />
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search SBUs..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No SBU found."}
            </CommandEmpty>
            <CommandGroup>
              {sbus.map((sbu) => (
                <CommandItem
                  key={sbu.id}
                  value={sbu.id}
                  onSelect={() => handleSelect(sbu.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === sbu.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{sbu.name}</span>
                    {sbu.sbu_head_email && (
                      <span className="text-xs text-gray-500">{sbu.sbu_head_email}</span>
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

export default SbuCombobox;
