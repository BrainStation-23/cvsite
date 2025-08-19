
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSbuSearch } from '@/hooks/use-sbu-search';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Fetch selected SBU separately to ensure it's always available
  const { data: selectedSbu } = useQuery({
    queryKey: ['selected-sbu', value],
    queryFn: async () => {
      if (!value) return null;
      
      const { data, error } = await supabase
        .from('sbus')
        .select('id, name, sbu_head_email, sbu_head_name, is_department, created_at, updated_at')
        .eq('id', value)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!value,
  });

  const { data: searchResult, isLoading } = useSbuSearch({
    searchQuery: searchQuery || null,
    page: 1,
    perPage: 50
  });

  const sbus = searchResult?.sbus || [];
  
  // Combine search results with selected SBU to ensure it's always available
  const allSbus = React.useMemo(() => {
    const combinedSbus = [...sbus];
    
    // Add selected SBU if it's not already in the search results
    if (selectedSbu && !sbus.some(s => s.id === selectedSbu.id)) {
      combinedSbus.unshift(selectedSbu);
    }
    
    // Remove duplicates based on id
    const uniqueSbus = combinedSbus.filter((sbu, index, self) => 
      index === self.findIndex(s => s.id === sbu.id)
    );
    
    return uniqueSbus;
  }, [sbus, selectedSbu]);

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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery('');
    }
  };

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
        <Command shouldFilter={false}>
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
              {allSbus.map((sbu) => (
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
