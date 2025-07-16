
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResourceTypeSearch } from '@/hooks/use-resource-type-search';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ResourceTypeComboboxProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ResourceTypeCombobox: React.FC<ResourceTypeComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select resource type...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch selected resource type separately to ensure it's always available
  const { data: selectedResourceType } = useQuery({
    queryKey: ['selected-resource-type', value],
    queryFn: async () => {
      if (!value) return null;
      
      const { data, error } = await supabase
        .from('resource_types')
        .select('*')
        .eq('id', value)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!value,
  });

  const { data: searchResult, isLoading } = useResourceTypeSearch({
    searchQuery: searchQuery || null,
    page: 1,
    perPage: 50
  });

  const resourceTypes = searchResult?.resourceTypes || [];
  
  // Combine search results with selected resource type to ensure it's always available
  const allResourceTypes = React.useMemo(() => {
    const combinedResourceTypes = [...resourceTypes];
    
    // Add selected resource type if it's not already in the search results
    if (selectedResourceType && !resourceTypes.some(rt => rt.id === selectedResourceType.id)) {
      combinedResourceTypes.unshift(selectedResourceType);
    }
    
    // Remove duplicates based on id
    const uniqueResourceTypes = combinedResourceTypes.filter((resourceType, index, self) => 
      index === self.findIndex(rt => rt.id === resourceType.id)
    );
    
    return uniqueResourceTypes;
  }, [resourceTypes, selectedResourceType]);

  const handleSelect = (resourceTypeId: string) => {
    if (resourceTypeId === value) {
      onValueChange(null);
    } else {
      onValueChange(resourceTypeId);
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
          {selectedResourceType ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{selectedResourceType.name}</span>
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
            placeholder="Search resource type..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No resource type found."}
            </CommandEmpty>
            <CommandGroup>
              {allResourceTypes.map((resourceType) => (
                <CommandItem
                  key={resourceType.id}
                  value={resourceType.id}
                  onSelect={() => handleSelect(resourceType.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === resourceType.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{resourceType.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ResourceTypeCombobox;
