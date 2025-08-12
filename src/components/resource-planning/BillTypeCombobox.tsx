
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BillTypeComboboxProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const BillTypeCombobox: React.FC<BillTypeComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select bill type...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch selected bill type separately to ensure it's always available
  const { data: selectedBillType } = useQuery({
    queryKey: ['selected-bill-type', value],
    queryFn: async () => {
      if (!value) return null;
      
      const { data, error } = await supabase
        .from('bill_types')
        .select('id, name')
        .eq('id', value)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!value,
  });

  const { data: billTypes, isLoading } = useQuery({
    queryKey: ['bill-types-search', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('bill_types')
        .select('id, name')
        .order('name', { ascending: true });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  // Combine search results with selected bill type to ensure it's always available
  const allBillTypes = React.useMemo(() => {
    const combinedBillTypes = [...(billTypes || [])];
    
    // Add selected bill type if it's not already in the search results
    if (selectedBillType && !billTypes?.some(bt => bt.id === selectedBillType.id)) {
      combinedBillTypes.unshift(selectedBillType);
    }
    
    // Remove duplicates based on id
    const uniqueBillTypes = combinedBillTypes.filter((billType, index, self) => 
      index === self.findIndex(bt => bt.id === billType.id)
    );
    
    return uniqueBillTypes;
  }, [billTypes, selectedBillType]);

  const handleSelect = (billTypeId: string) => {
    if (billTypeId === value) {
      onValueChange(null);
    } else {
      onValueChange(billTypeId);
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
          {selectedBillType ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{selectedBillType.name}</span>
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
            placeholder="Search bill types..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No bill type found."}
            </CommandEmpty>
            <CommandGroup>
              {allBillTypes.map((billType) => (
                <CommandItem
                  key={billType.id}
                  value={billType.id}
                  onSelect={() => handleSelect(billType.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === billType.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{billType.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BillTypeCombobox;
