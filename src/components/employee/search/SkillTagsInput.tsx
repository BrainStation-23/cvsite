import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SkillTagsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Suggests skills that have been used in any employee's technical or specialized skills fields.
 */
const SkillTagsInput: React.FC<SkillTagsInputProps> = ({
  value,
  onChange,
  placeholder = 'Add skills...',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch distinct skill names used by any profile
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        // This assumes a "skills" column on an "employee_skills" or similar table
        // Adapt as needed for your schema. Here, we try to generalize.
        // We'll fetch all skill names from `profile_skills` table if it exists,
        // otherwise, fetch from the `employee_profiles` with "skills" field if it's an array.
        // Example using a `skills` table:
        const { data, error } = await supabase
          .from('skills')
          .select('name')
          .order('name', { ascending: true });
        if (error) throw error;

        if (data && Array.isArray(data)) {
          setSuggestions(data.map(row => row.name).filter(Boolean));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        // Fallback: If you have no 'skills' table, try to select distinct skills from profiles
        // This fallback assumes 'employee_profiles' table has an array column named 'skills'
        try {
          const { data } = await supabase
            .from('employee_profiles')
            .select('skills')
            .not('skills', 'is', null);
          const allSkillsSet = new Set<string>();
          if (data) {
            data.forEach(profile => {
              if (Array.isArray(profile.skills)) {
                profile.skills.forEach((s: string) => {
                  if (s && typeof s === 'string') allSkillsSet.add(s.trim());
                });
              }
            });
          }
          setSuggestions(Array.from(allSkillsSet).sort());
        } catch (error2) {
          setSuggestions([]);
        }
      }
    };
    fetchSkills();
  }, []);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter(s => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions
    .filter(
      skill =>
        skill.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(skill)
    )
    .slice(0, 8);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px] bg-background">
          {value.map(skill => (
            <Badge key={skill} variant="secondary" className="flex items-center gap-1">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                disabled={disabled}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={inputValue}
            onChange={e => {
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
            {filteredSuggestions.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
              >
                {skill}
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
          onClick={() => addSkill(inputValue)}
          className="h-6 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add "{inputValue}"
        </Button>
      )}
    </div>
  );
};

export default SkillTagsInput;
