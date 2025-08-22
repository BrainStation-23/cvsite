
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeviconService, DeviconTechnology } from '@/utils/deviconUtils';

interface TechnicalSkillInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TechnicalSkillInput: React.FC<TechnicalSkillInputProps> = ({
  value,
  onChange,
  placeholder = "Enter technical skill",
  className
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [technologies, setTechnologies] = useState<DeviconTechnology[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch technologies from Devicon API
  useEffect(() => {
    const fetchTechnologies = async () => {
      setIsLoading(true);
      const result = await DeviconService.getTechnologies();
      setTechnologies(result.technologies);
      setError(result.error);
      setIsLoading(false);
    };

    fetchTechnologies();
  }, []);

    const popoverRef = useRef<HTMLDivElement>(null); // Ref for detecting outside clicks

  // Close the popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false); // Close on outside click
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter technologies based on search input using the utility
  const filteredTechnologies = DeviconService.filterTechnologies(searchValue, technologies, 15);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearchValue(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (inputValue: string) => {
    setSearchValue(inputValue);
    onChange(inputValue);
    setOpen(inputValue.length > 0 && !isLoading);
  };
   const handleFocus = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className={cn("pr-8", className)}
            onFocus={handleFocus}
          />
          {isLoading ? (
            <Loader className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
          ) : searchValue && (
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search technologies..." 
            value={searchValue}
            onValueChange={handleInputChange}
            className="border-none focus:ring-0"
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">
                <Loader className="mx-auto h-4 w-4 animate-spin mb-2" />
                Loading technologies...
              </div>
            ) : error ? (
              <div className="py-6 text-center text-sm text-red-500">
                {error}
              </div>
            ) : filteredTechnologies.length === 0 ? (
              <CommandEmpty>No technology found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredTechnologies.map((tech) => (
                  <CommandItem
                    key={tech.name}
                    value={tech.name}
                    onSelect={() => handleSelect(tech.name)}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <img 
                      src={DeviconService.getDeviconUrl(tech.name)} 
                      alt={tech.name}
                      className="w-5 h-5 flex-shrink-0"
                      onError={(e) => {
                        // Fallback if icon doesn't exist
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium capitalize">{DeviconService.getDisplayName(tech)}</div>
                      {tech.altnames.length > 1 && (
                        <div className="text-xs text-gray-500 truncate">
                          {tech.altnames.slice(1, 3).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tech.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 flex-shrink-0",
                        value === tech.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
