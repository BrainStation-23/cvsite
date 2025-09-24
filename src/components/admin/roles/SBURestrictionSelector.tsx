import React from 'react';
import { Check, ChevronsUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useSBUs } from '@/hooks/rbac/useModules';
import { cn } from '@/lib/utils';

interface SBURestrictionSelectorProps {
  value: string[];
  onChange: (sbuIds: string[]) => void;
  compact?: boolean;
}

export const SBURestrictionSelector: React.FC<SBURestrictionSelectorProps> = ({
  value = [],
  onChange,
  compact = false,
}) => {
  const { data: sbus, isLoading } = useSBUs();
  const [open, setOpen] = React.useState(false);

  const handleSBUToggle = (sbuId: string) => {
    const newValue = value.includes(sbuId)
      ? value.filter(id => id !== sbuId)
      : [...value, sbuId];
    onChange(newValue);
  };

  const getSBUNames = () => {
    if (!sbus) return [];
    return value
      .map(id => sbus.find(sbu => sbu.id === id)?.name)
      .filter(Boolean) as string[];
  };

  if (isLoading || !sbus) {
    return compact ? (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="h-6 w-6 p-0 opacity-50"
        aria-label="Loading SBU restrictions"
      >
        <Filter className="h-3 w-3" />
      </Button>
    ) : (
      <div className="text-xs text-muted-foreground">Loading SBUs...</div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {compact ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            aria-label="SBU restrictions"
          >
            <Filter className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-xs h-8"
            size="sm"
          >
            <div className="flex flex-wrap gap-1">
              {value.length === 0 ? (
                <span className="text-muted-foreground">All SBUs</span>
              ) : value.length === sbus.length ? (
                <span className="text-muted-foreground">All SBUs</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {getSBUNames().slice(0, 2).map((name) => (
                    <Badge key={name} variant="secondary" className="text-xs px-1 py-0">
                      {name}
                    </Badge>
                  ))}
                  {value.length > 2 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      +{value.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Select SBUs (empty = all SBUs)
          </div>
          {sbus.map((sbu) => (
            <div key={sbu.id} className="flex items-center space-x-2">
              <Checkbox
                id={sbu.id}
                checked={value.includes(sbu.id)}
                onCheckedChange={() => handleSBUToggle(sbu.id)}
              />
              <label
                htmlFor={sbu.id}
                className="text-xs font-medium cursor-pointer flex-1"
              >
                {sbu.name}
              </label>
            </div>
          ))}
          {value.length > 0 && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange([])}
                className="w-full text-xs h-7"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};