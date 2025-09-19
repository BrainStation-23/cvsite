
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BillType {
  id: string;
  name: string;
}

interface BillTypeMultiSelectProps {
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
}

export const BillTypeMultiSelect: React.FC<BillTypeMultiSelectProps> = ({
  selectedValues,
  onSelectionChange,
  placeholder = "Select bill types...",
  onMouseDown,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: billTypes = [], isLoading } = useQuery({
    queryKey: ['bill-types-for-multi-select', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('bill_types')
        .select('id, name')
        .order('name', { ascending: true });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      
      // Filter out any bill types with empty or null names
      return (data as BillType[]).filter(bt => bt.name && bt.name.trim() !== '');
    },
  });

  const selectedBillTypes = billTypes.filter(bt => selectedValues.includes(bt.id));

  const handleSelect = (billTypeId: string) => {
    if (selectedValues.includes(billTypeId)) {
      onSelectionChange(selectedValues.filter(id => id !== billTypeId));
    } else {
      onSelectionChange([...selectedValues, billTypeId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(billTypes.map(bt => bt.id));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const removeBillType = (billTypeId: string) => {
    onSelectionChange(selectedValues.filter(id => id !== billTypeId));
  };

  return (
    <div className="space-y-2" onMouseDown={onMouseDown}>
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
                  {selectedValues.length} bill type{selectedValues.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
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
                {isLoading ? "Loading..." : "No bill types found."}
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
                {billTypes.map((billType) => (
                  <CommandItem
                    key={billType.id}
                    value={billType.id}
                    onSelect={() => handleSelect(billType.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(billType.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {billType.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedBillTypes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedBillTypes.map((billType) => (
            <Badge key={billType.id} variant="secondary" className="flex items-center gap-1">
              {billType.name}
              <button
                onClick={() => removeBillType(billType.id)}
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
