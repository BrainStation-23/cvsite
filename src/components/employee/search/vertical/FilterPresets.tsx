
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Plus } from 'lucide-react';

interface FilterPresetsProps {
  onLoadPreset: (preset: any) => void;
  onSavePreset: (preset: any) => void;
}

const FilterPresets: React.FC<FilterPresetsProps> = ({
  onLoadPreset,
  onSavePreset
}) => {
  // Placeholder presets - in a real app, these would come from user preferences or localStorage
  const presets = [
    { id: 'recent-grads', name: 'Recent Graduates', description: 'Graduated in last 3 years' },
    { id: 'senior-devs', name: 'Senior Developers', description: '5+ years experience' },
    { id: 'data-science', name: 'Data Science Team', description: 'ML/AI skills' },
  ];

  return (
    <Card className="border-indigo-200 bg-indigo-50/30 dark:bg-indigo-900/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <Bookmark className="h-4 w-4" />
          Quick Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onLoadPreset(preset)}
            className="w-full justify-start text-left h-auto p-2 text-xs"
          >
            <div>
              <div className="font-medium">{preset.name}</div>
              <div className="text-gray-500">{preset.description}</div>
            </div>
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSavePreset({})}
          className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
        >
          <Plus className="h-3 w-3 mr-1" />
          Save Current Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default FilterPresets;
