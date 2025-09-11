import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import SbuCombobox from '@/components/admin/user/SbuCombobox';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BenchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSbu: string | null;
  setSelectedSbu: (sbu: string | null) => void;
  selectedExpertise: string | null;
  setSelectedExpertise: (expertise: string | null) => void;
  selectedBillType: string | null;
  setSelectedBillType: (billType: string | null) => void;
  clearFilters: () => void;
}

// Expertise Combobox Component
const ExpertiseCombobox: React.FC<{
  value: string | null;
  onValueChange: (value: string | null) => void;
}> = ({ value, onValueChange }) => {
  const [open, setOpen] = React.useState(false);
  
  const { data: expertiseTypes } = useQuery({
    queryKey: ['expertise-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expertise_types')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const selectedExpertise = expertiseTypes?.find(exp => exp.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedExpertise ? selectedExpertise.name : "Select expertise..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search expertise..." />
          <CommandList>
            <CommandEmpty>No expertise found.</CommandEmpty>
            <CommandGroup>
              {expertiseTypes?.map((expertise) => (
                <CommandItem
                  key={expertise.id}
                  value={expertise.id}
                  onSelect={() => {
                    onValueChange(expertise.id === value ? null : expertise.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === expertise.id ? "opacity-100" : "opacity-0"
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
  );
};

// Bill Type Combobox Component
const BillTypeCombobox: React.FC<{
  value: string | null;
  onValueChange: (value: string | null) => void;
}> = ({ value, onValueChange }) => {
  const [open, setOpen] = React.useState(false);
  
  const { data: billTypes } = useQuery({
    queryKey: ['bill-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bill_types')
        .select('id, name, color_code')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const selectedBillType = billTypes?.find(bt => bt.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedBillType ? (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedBillType.color_code }}
              />
              {selectedBillType.name}
            </div>
          ) : (
            "Select bill type..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search bill types..." />
          <CommandList>
            <CommandEmpty>No bill type found.</CommandEmpty>
            <CommandGroup>
              {billTypes?.map((billType) => (
                <CommandItem
                  key={billType.id}
                  value={billType.id}
                  onSelect={() => {
                    onValueChange(billType.id === value ? null : billType.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === billType.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: billType.color_code }}
                    />
                    {billType.name}
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

export const BenchFilters: React.FC<BenchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedSbu,
  setSelectedSbu,
  selectedExpertise,
  setSelectedExpertise,
  selectedBillType,
  setSelectedBillType,
  clearFilters,
}) => {
  const hasActiveFilters = selectedSbu || selectedExpertise || selectedBillType || searchQuery;

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label className="text-sm font-medium">Filters</Label>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              Clear all
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-query">Search</Label>
            <Input
              id="search-query"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sbu-filter">Filter by SBU</Label>
            <SbuCombobox
              value={selectedSbu}
              onValueChange={setSelectedSbu}
              placeholder="Select SBU..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise-filter">Filter by Expertise</Label>
            <ExpertiseCombobox
              value={selectedExpertise}
              onValueChange={setSelectedExpertise}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-type-filter">Filter by Bill Type</Label>
            <BillTypeCombobox
              value={selectedBillType}
              onValueChange={setSelectedBillType}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {selectedSbu && (
              <Badge variant="secondary" className="flex items-center gap-1">
                SBU Filter
                <button
                  onClick={() => setSelectedSbu(null)}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {selectedExpertise && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Expertise Filter
                <button
                  onClick={() => setSelectedExpertise(null)}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
            {selectedBillType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Bill Type Filter
                <button
                  onClick={() => setSelectedBillType(null)}
                  className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="h-2 w-2" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};