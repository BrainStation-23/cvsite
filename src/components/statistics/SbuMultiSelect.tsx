
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  const { data: sbus = [], isLoading } = useQuery({
    queryKey: ['sbus-for-multi-select', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('sbus')
        .select('id, name')
        .order('name', { ascending: true });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      
      // Filter out any SBUs with empty or null names
      return (data as Sbu[]).filter(sbu => sbu.name && sbu.name.trim() !== '');
    },
  });

  const selectedSbus = sbus.filter(sbu => selectedValues.includes(sbu.id));

  const handleSelect = (sbuId: string) => {
    if (selectedValues.includes(sbuId)) {
      onSelectionChange(selectedValues.filter(id => id !== sbuId));
    } else {
      onSelectionChange([...selectedValues, sbuId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(sbus.map(sbu => sbu.id));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const removeSbu = (sbuId: string) => {
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
