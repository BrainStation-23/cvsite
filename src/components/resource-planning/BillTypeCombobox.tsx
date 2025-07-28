
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
  
  const { data: billTypes, isLoading } = useQuery({
    queryKey: ['bill-types', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('bill_types')
        .select('id, name')
        .order('name', { ascending: true });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const selectedBillType = billTypes?.find(billType => billType.id === value);

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
        <Command>
          <CommandInput 
            placeholder="Search bill type..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No bill type found."}
            </CommandEmpty>
            <CommandGroup>
              {billTypes?.map((billType) => (
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
