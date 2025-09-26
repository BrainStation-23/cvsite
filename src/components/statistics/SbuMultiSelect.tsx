
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSbuSearch } from '@/hooks/use-sbu-search';
import { useUserAccessibleSbus } from '@/hooks/use-user-accessible-sbus';

interface Sbu {
  id: string;
  name: string;
}

interface SbuMultiSelectProps {
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
}

export const SbuMultiSelect: React.FC<SbuMultiSelectProps> = ({
  selectedValues,
  onSelectionChange,
  placeholder = "Select SBUs..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get user-accessible SBUs and determine if user is SBU-bound
  const { data: userAccessibleResult, isLoading: userAccessibleLoading } = useUserAccessibleSbus({
    searchQuery: searchQuery || null,
  });

  // Determine if user is SBU-bound from the RPC response
  const isSbuBound = userAccessibleResult?.isSbuBound ?? false;

  // Fetch all SBUs only if user is NOT SBU-bound
  const { data: allSbuResult, isLoading: allSbuLoading } = useSbuSearch({
    searchQuery: !isSbuBound ? (searchQuery || null) : null,
    page: 1,
    perPage: 50
  });

  // Determine which data source to use based on SBU-bound status
  const sbus = isSbuBound 
    ? (userAccessibleResult?.sbus || [])
    : (allSbuResult?.sbus || []);

  const isLoading = userAccessibleLoading || allSbuLoading;

  // Auto-select all accessible SBUs for SBU-bound users
  useEffect(() => {
    if (!isLoading && isSbuBound && sbus.length > 0 && selectedValues.length === 0) {
      onSelectionChange(sbus.map(sbu => sbu.id));
    }
  }, [isLoading, isSbuBound, sbus, selectedValues.length, onSelectionChange]);

  const selectedSbus = sbus.filter(sbu => selectedValues.includes(sbu.id));

  const handleSelect = (sbuId: string) => {
    if (selectedValues.includes(sbuId)) {
      // For SBU-bound users, prevent deselecting if it would leave them with no SBUs
      if (isSbuBound && selectedValues.length === 1) {
        return; // Don't allow deselecting the last SBU for SBU-bound users
      }
      onSelectionChange(selectedValues.filter(id => id !== sbuId));
    } else {
      onSelectionChange([...selectedValues, sbuId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(sbus.map(sbu => sbu.id));
  };

  const handleClearAll = () => {
    // For SBU-bound users, don't allow clearing all - keep all accessible SBUs selected
    if (isSbuBound) {
      return;
    }
    onSelectionChange([]);
  };

  const removeSbu = (sbuId: string) => {
    // For SBU-bound users, prevent removing if it would leave them with no SBUs
    if (isSbuBound && selectedValues.length === 1) {
      return;
    }
    onSelectionChange(selectedValues.filter(id => id !== sbuId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <div className="flex flex-wrap gap-1">
              {selectedValues.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <span className="text-sm">
                  {selectedValues.length} SBU{selectedValues.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search SBUs..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No SBUs found."}
              </CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={handleSelectAll}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Select All</span>
                  </div>
                </CommandItem>
                <CommandItem onSelect={handleClearAll}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Clear All</span>
                  </div>
                </CommandItem>
                {sbus.map((sbu) => (
                  <CommandItem
                    key={sbu.id}
                    value={sbu.id}
                    onSelect={() => handleSelect(sbu.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(sbu.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {sbu.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSbus.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedSbus.map((sbu) => (
            <Badge key={sbu.id} variant="secondary" className="flex items-center gap-1">
              {sbu.name}
              <button
                onClick={() => removeSbu(sbu.id)}
                className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
