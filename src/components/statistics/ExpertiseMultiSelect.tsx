import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Expertise {
  id: string;
  name: string;
}

interface ExpertiseMultiSelectProps {
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
}

export const ExpertiseMultiSelect: React.FC<ExpertiseMultiSelectProps> = ({
  selectedValues,
  onSelectionChange,
  placeholder = "Select Expertises..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: expertises = [], isLoading } = useQuery({
    queryKey: ['expertises-for-multi-select', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('expertise_types')
        .select('id, name')
        .order('name', { ascending: true });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      
      // Filter out any expertises with empty or null names
      return (data as Expertise[]).filter(expertise => expertise.name && expertise.name.trim() !== '');
    },
  });

  const selectedExpertises = expertises.filter(expertise => selectedValues.includes(expertise.id));

  const handleSelect = (expertiseId: string) => {
    if (selectedValues.includes(expertiseId)) {
      onSelectionChange(selectedValues.filter(id => id !== expertiseId));
    } else {
      onSelectionChange([...selectedValues, expertiseId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(expertises.map(expertise => expertise.id));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const removeExpertise = (expertiseId: string) => {
    onSelectionChange(selectedValues.filter(id => id !== expertiseId));
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
                  {selectedValues.length} Expertise{selectedValues.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search Expertises..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading..." : "No Expertises found."}
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
                {expertises.map((expertise) => (
                  <CommandItem
                    key={expertise.id}
                    value={expertise.id}
                    onSelect={() => handleSelect(expertise.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(expertise.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {expertise.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedExpertises.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedExpertises.map((expertise) => (
            <Badge key={expertise.id} variant="secondary" className="flex items-center gap-1">
              {expertise.name}
              <button
                onClick={() => removeExpertise(expertise.id)}
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