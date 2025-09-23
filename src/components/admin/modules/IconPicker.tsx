import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Common module icons for quick selection
const POPULAR_ICONS = [
  'Home', 'User', 'Settings', 'Database', 'FileText', 'Calendar', 
  'BarChart3', 'Shield', 'Users', 'AlertTriangle', 'LayoutDashboard',
  'Search', 'MessageSquare', 'Network', 'FolderOpen', 'CalendarDays',
  'UserCheck', 'UserX', 'List', 'ContactRound'
];

// Get all available Lucide icons
const getAllIcons = () => {
  return Object.keys(LucideIcons).filter(
    (key) => key !== 'default' && key !== 'createLucideIcon' && 
    typeof LucideIcons[key as keyof typeof LucideIcons] === 'function'
  );
};

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
}

export const IconPicker: React.FC<IconPickerProps> = ({ 
  value, 
  onChange, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allIcons = getAllIcons();
  const filteredIcons = searchQuery
    ? allIcons.filter(icon => 
        icon.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : POPULAR_ICONS;

  const renderIcon = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
    if (!IconComponent) return null;
    return <IconComponent className="h-4 w-4" />;
  };

  const currentIcon = value ? renderIcon(value) : <div className="h-4 w-4 bg-muted rounded" />;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-start gap-2 h-10"
        >
          {currentIcon}
          <span className="text-muted-foreground">
            {value || 'Select icon...'}
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {!searchQuery && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-foreground">Popular Icons</h4>
              <Badge variant="outline" className="text-xs text-muted-foreground mb-3">
                {POPULAR_ICONS.length} icons
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
            {filteredIcons.map((iconName) => {
              const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<any>;
              if (!IconComponent) return null;

              return (
                <Button
                  key={iconName}
                  variant={value === iconName ? "default" : "ghost"}
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                  title={iconName}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              );
            })}
          </div>

          {searchQuery && filteredIcons.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No icons found matching "{searchQuery}"
            </div>
          )}

          {searchQuery && (
            <div className="text-xs text-muted-foreground">
              Showing {filteredIcons.length} of {allIcons.length} icons
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};