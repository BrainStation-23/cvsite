
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Devicon technology list - this will be the source of truth for technical skills
const DEVICON_TECHNOLOGIES = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'nodejs', 'python', 'java', 'csharp', 'cplusplus',
  'html5', 'css3', 'sass', 'bootstrap', 'tailwindcss', 'mysql', 'postgresql', 'mongodb', 'redis', 'docker',
  'kubernetes', 'aws', 'azure', 'googlecloud', 'git', 'github', 'gitlab', 'jenkins', 'terraform', 'ansible',
  'nginx', 'apache', 'linux', 'ubuntu', 'windows', 'macos', 'vscode', 'intellij', 'eclipse', 'figma',
  'photoshop', 'illustrator', 'sketch', 'firebase', 'supabase', 'vercel', 'netlify', 'heroku', 'digitalocean',
  'express', 'nextjs', 'nuxtjs', 'svelte', 'flutter', 'reactnative', 'ionic', 'electron', 'graphql', 'rest',
  'jest', 'cypress', 'selenium', 'mocha', 'chai', 'webpack', 'vite', 'rollup', 'babel', 'eslint',
  'prettier', 'redux', 'mobx', 'rxjs', 'lodash', 'jquery', 'd3js', 'threejs', 'socketio', 'webrtc'
];

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

  // Filter technologies based on search input
  const filteredTechnologies = DEVICON_TECHNOLOGIES.filter(tech =>
    tech.toLowerCase().includes(searchValue.toLowerCase())
  ).slice(0, 10); // Limit to 10 results for performance

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
    setOpen(inputValue.length > 0);
  };

  const getDeviconUrl = (techName: string) => {
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${techName}/${techName}-original.svg`;
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
            onFocus={() => setOpen(searchValue.length > 0)}
          />
          {searchValue && (
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search technologies..." 
            value={searchValue}
            onValueChange={handleInputChange}
            className="border-none focus:ring-0"
          />
          <CommandList>
            <CommandEmpty>No technology found.</CommandEmpty>
            <CommandGroup>
              {filteredTechnologies.map((tech) => (
                <CommandItem
                  key={tech}
                  value={tech}
                  onSelect={() => handleSelect(tech)}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <img 
                    src={getDeviconUrl(tech)} 
                    alt={tech}
                    className="w-5 h-5 flex-shrink-0"
                    onError={(e) => {
                      // Fallback if icon doesn't exist
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="flex-1 capitalize">{tech}</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === tech ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
