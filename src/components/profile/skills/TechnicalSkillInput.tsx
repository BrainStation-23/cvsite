
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviconTechnology {
  name: string;
  altnames: string[];
  tags: string[];
  versions: {
    svg: string[];
    font: string[];
  };
  color: string;
  aliases: Array<{
    base: string;
    alias: string;
  }>;
}

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
      setError(null);
      try {
        const response = await fetch('https://raw.githubusercontent.com/devicons/devicon/master/devicon.json');
        if (!response.ok) {
          throw new Error('Failed to fetch technologies');
        }
        const data: DeviconTechnology[] = await response.json();
        setTechnologies(data);
      } catch (err) {
        console.error('Error fetching technologies:', err);
        setError('Failed to load technologies');
        // Fallback to a basic list if API fails
        setTechnologies([
          { name: 'javascript', altnames: ['js'], tags: ['programming'], versions: { svg: ['original'], font: ['plain'] }, color: '#f7df1e', aliases: [] },
          { name: 'typescript', altnames: ['ts'], tags: ['programming'], versions: { svg: ['original'], font: ['plain'] }, color: '#3178c6', aliases: [] },
          { name: 'react', altnames: ['reactjs'], tags: ['framework'], versions: { svg: ['original'], font: ['plain'] }, color: '#61dafb', aliases: [] },
          { name: 'nodejs', altnames: ['node'], tags: ['runtime'], versions: { svg: ['original'], font: ['plain'] }, color: '#339933', aliases: [] },
          { name: 'python', altnames: [], tags: ['programming'], versions: { svg: ['original'], font: ['plain'] }, color: '#3776ab', aliases: [] }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTechnologies();
  }, []);

  // Filter technologies based on search input
  const filteredTechnologies = technologies.filter(tech => {
    const searchTerm = searchValue.toLowerCase();
    // Search in name, altnames, and tags
    return tech.name.toLowerCase().includes(searchTerm) ||
           tech.altnames.some(alt => alt.toLowerCase().includes(searchTerm)) ||
           tech.tags.some(tag => tag.toLowerCase().includes(searchTerm));
  }).slice(0, 15); // Limit to 15 results for performance

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
    // Only open dropdown if we have input and not loading
    if (inputValue.length > 0 && !isLoading) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleInputFocus = () => {
    // Open dropdown on focus if we have search value and not loading
    if (searchValue.length > 0 && !isLoading) {
      setOpen(true);
    }
  };

  const getDeviconUrl = (techName: string) => {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${techName}/${techName}-original.svg`;
  };

  const getDisplayName = (tech: DeviconTechnology) => {
    // Use the most common altname if available, otherwise use the name
    if (tech.altnames.length > 0) {
      return tech.altnames[0];
    }
    return tech.name;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className={cn("pr-8", className)}
          />
          {isLoading ? (
            <Loader className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
          ) : searchValue && (
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command shouldFilter={false}>
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
                      src={getDeviconUrl(tech.name)} 
                      alt={tech.name}
                      className="w-5 h-5 flex-shrink-0"
                      onError={(e) => {
                        // Fallback if icon doesn't exist
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium capitalize">{getDisplayName(tech)}</div>
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
