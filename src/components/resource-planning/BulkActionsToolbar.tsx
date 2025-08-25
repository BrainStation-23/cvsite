
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, CheckCircle2, Copy } from 'lucide-react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkComplete: () => void;
  onBulkValidate?: () => void;
  onBulkCopy: () => void;
  onClearSelection: () => void;
  showValidate?: boolean;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkComplete,
  onBulkValidate,
  onBulkCopy,
  onClearSelection,
  showValidate = false
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
      <span className="text-sm text-muted-foreground">
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>
      
      <div className="flex items-center gap-1 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkComplete}
          className="h-8"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Complete
        </Button>
        
        {showValidate && onBulkValidate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkValidate}
            className="h-8"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Validate
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkCopy}
          className="h-8"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="h-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8 ml-2"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};
