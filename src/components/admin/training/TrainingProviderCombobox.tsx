
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface TrainingProviderComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TrainingProviderCombobox: React.FC<TrainingProviderComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Select training provider...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('trainings')
          .select('provider')
          .not('provider', 'is', null);

        if (error) throw error;

        // Extract unique providers
        const uniqueProviders = [...new Set(data.map(item => item.provider))].sort();
        setProviders(uniqueProviders);
      } catch (error) {
        console.error('Error fetching training providers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-xs h-7"
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search providers..." className="h-8" />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No providers found."}
            </CommandEmpty>
            <CommandGroup>
              {providers.map((provider) => (
                <CommandItem
                  key={provider}
                  value={provider}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3",
                      value === provider ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {provider}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
