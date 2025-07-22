
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Award, X } from 'lucide-react';

interface AchievementFilterDropdownProps {
  value: string | null;
  onValueChange: (value: string) => void;
  onClear: () => void;
}

const AchievementFilterDropdown: React.FC<AchievementFilterDropdownProps> = ({
  value,
  onValueChange,
  onClear
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value || '');

  const handleApply = () => {
    onValueChange(localValue);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalValue('');
    onClear();
    setIsOpen(false);
  };

  const hasFilter = value && value.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={hasFilter ? "default" : "outline"} 
          size="sm"
          className="h-8 gap-2"
        >
          <Award className="h-4 w-4" />
          Achievements
          {hasFilter && (
            <X 
              className="h-3 w-3 ml-1" 
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Filter by Achievements</h4>
            <p className="text-sm text-muted-foreground">
              Search by achievement title or description
            </p>
          </div>
          
          <Input
            placeholder="Enter achievement title..."
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
          />
          
          <div className="flex gap-2">
            <Button onClick={handleApply} size="sm" className="flex-1">
              Apply Filter
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm">
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AchievementFilterDropdown;
