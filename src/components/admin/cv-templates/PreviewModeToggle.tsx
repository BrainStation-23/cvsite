
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Layout } from 'lucide-react';

interface PreviewModeToggleProps {
  mode: 'continuous' | 'paginated';
  onModeChange: (mode: 'continuous' | 'paginated') => void;
}

export const PreviewModeToggle: React.FC<PreviewModeToggleProps> = ({
  mode,
  onModeChange
}) => {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-md p-1">
      <Button
        size="sm"
        variant={mode === 'continuous' ? 'default' : 'ghost'}
        onClick={() => onModeChange('continuous')}
        className="h-7 text-xs"
      >
        <Layout className="h-3 w-3 mr-1" />
        Continuous
      </Button>
      <Button
        size="sm"
        variant={mode === 'paginated' ? 'default' : 'ghost'}
        onClick={() => onModeChange('paginated')}
        className="h-7 text-xs"
      >
        <FileText className="h-3 w-3 mr-1" />
        Page Breaks
      </Button>
    </div>
  );
};
