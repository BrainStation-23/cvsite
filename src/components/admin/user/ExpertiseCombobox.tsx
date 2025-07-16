
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExpertiseSearch } from '@/hooks/use-expertise-search';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ExpertiseComboboxProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ExpertiseCombobox: React.FC<ExpertiseComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select expertise...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  console.log('=== ExpertiseCombobox Debug ===');
  console.log('Current value prop:', value);
  console.log('Disabled:', disabled);
  
  // Fetch selected expertise separately to ensure it's always available
  const { data: selectedExpertise, isLoading: selectedLoading, error: selectedError } = useQuery({
    queryKey: ['selected-expertise', value],
    queryFn: async () => {
      console.log('Fetching selected expertise for value:', value);
      if (!value) {
        console.log('No value provided, returning null');
        return null;
      }
      
      const { data, error } = await supabase
        .from('expertise_types')
        .select('*')
        .eq('id', value)
        .single();
      
      console.log('Selected expertise query result:', { data, error });
      
      if (error) {
        console.error('Error fetching selected expertise:', error);
        throw error;
      }
      return data;
    },
    enabled: !!value,
  });

  const { data: searchResult, isLoading } = useExpertiseSearch({
    searchQuery: searchQuery || null,
    page: 1,
    perPage: 50
  });

  const expertiseTypes = searchResult?.expertiseTypes || [];
  
  console.log('Search result expertise types:', expertiseTypes);
  console.log('Selected expertise from query:', selectedExpertise);
  console.log('Selected expertise loading:', selectedLoading);
  console.log('Selected expertise error:', selectedError);
  
  // Combine search results with selected expertise to ensure it's always available
  const allExpertiseTypes = React.useMemo(() => {
    const combinedExpertise = [...expertiseTypes];
    
    // Add selected expertise if it's not already in the search results
    if (selectedExpertise && !expertiseTypes.some(e => e.id === selectedExpertise.id)) {
      console.log('Adding selected expertise to list:', selectedExpertise);
      combinedExpertise.unshift(selectedExpertise);
    }
    
    // Remove duplicates based on id
    const uniqueExpertise = combinedExpertise.filter((expertise, index, self) => 
      index === self.findIndex(e => e.id === expertise.id)
    );
    
    console.log('Final combined expertise types:', uniqueExpertise);
    return uniqueExpertise;
  }, [expertiseTypes, selectedExpertise]);

  const handleSelect = (expertiseId: string) => {
    console.log('Selecting expertise:', expertiseId, 'current value:', value);
    if (expertiseId === value) {
      console.log('Deselecting expertise');
      onValueChange(null);
    } else {
      console.log('Setting new expertise:', expertiseId);
      onValueChange(expertiseId);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Clearing expertise selection');
    onValueChange(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log('Popover open state changing to:', newOpen);
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  };

  console.log('Rendering with selected expertise:', selectedExpertise);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedExpertise ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{selectedExpertise.name}</span>
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
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search expertise..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No expertise found."}
            </CommandEmpty>
            <CommandGroup>
              {allExpertiseTypes.map((expertise) => (
                <CommandItem
                  key={expertise.id}
                  value={expertise.id}
                  onSelect={() => handleSelect(expertise.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === expertise.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{expertise.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ExpertiseCombobox;
