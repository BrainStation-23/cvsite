import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSbuSearch } from '@/hooks/use-sbu-search';
import { useUserAccessibleSbus } from '@/hooks/use-user-accessible-sbus';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SbuComboboxProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  targetUserId?: string | null;
}

const SbuCombobox: React.FC<SbuComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select SBU...",
  disabled = false,
  targetUserId = null
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Always fetch user-accessible data first to determine SBU-bound status
  const { data: userAccessibleResult, isLoading: userAccessibleLoading } = useUserAccessibleSbus({
    searchQuery: searchQuery || null,
    targetUserId: targetUserId,
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
  const isLoading = isSbuBound ? userAccessibleLoading : allSbuLoading;

  // Auto-select user's own SBU if SBU-bound and no value is set
  useEffect(() => {
    if (isSbuBound && !value && userAccessibleResult?.defaultSbuId) {
      onValueChange(userAccessibleResult.defaultSbuId);
    }
  }, [isSbuBound, value, userAccessibleResult?.defaultSbuId, onValueChange]);
  
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
    // For SBU-bound users, prevent deselecting if it would leave them with no SBUs
    if (isSbuBound && sbuId === value) {
      // Don't allow deselecting the current SBU for SBU-bound users
      setOpen(false);
      return;
    }
    
    if (sbuId === value) {
      onValueChange(null);
    } else {
      onValueChange(sbuId);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Prevent clearing for SBU-bound users
    if (isSbuBound) {
      return;
    }
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
              <span
                className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                onClick={handleClear}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onValueChange(null);
                  }
                }}
                aria-label="Clear selection"
                role="button"
                tabIndex={0}
                title="Clear selection"
              >
                <X className="h-4 w-4" />
              </span>
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
