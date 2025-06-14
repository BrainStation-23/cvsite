
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TechnologyTagsInputProps {
  value: string[];
  onChange: (technologies: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TechnologyTagsInput: React.FC<TechnologyTagsInputProps> = ({
  value,
  onChange,
  placeholder = "Add technologies...",
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch technology suggestions from existing projects
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('technologies_used')
          .not('technologies_used', 'is', null);

        if (error) throw error;

        const allTechnologies = new Set<string>();
        data?.forEach(project => {
          if (project.technologies_used) {
            project.technologies_used.forEach((tech: string) => {
              if (tech.trim()) {
                allTechnologies.add(tech.trim());
              }
            });
          }
        });

        setSuggestions(Array.from(allTechnologies).sort());
      } catch (error) {
        console.error('Error fetching technologies:', error);
      }
    };

    fetchTechnologies();
  }, []);

  const addTechnology = (tech: string) => {
    const trimmedTech = tech.trim();
    if (trimmedTech && !value.includes(trimmedTech)) {
      onChange([...value, trimmedTech]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTechnology = (techToRemove: string) => {
    onChange(value.filter(tech => tech !== techToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTechnology(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTechnology(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    tech => 
      tech.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tech)
  ).slice(0, 8);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px] bg-background">
          {value.map((tech) => (
            <Badge key={tech} variant="secondary" className="flex items-center gap-1">
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(tech)}
                disabled={disabled}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
            className="border-0 shadow-none p-0 h-auto min-w-[120px] flex-1"
          />
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => addTechnology(tech)}
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {inputValue && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addTechnology(inputValue)}
          className="h-6 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add "{inputValue}"
        </Button>
      )}
    </div>
  );
};

export default TechnologyTagsInput;
