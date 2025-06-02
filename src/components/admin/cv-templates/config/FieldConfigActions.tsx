
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Save, RotateCcw } from 'lucide-react';

interface FieldConfigActionsProps {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  onDelete: () => void;
}

const FieldConfigActions: React.FC<FieldConfigActionsProps> = ({
  hasChanges,
  isSaving,
  onSave,
  onReset,
  onDelete
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <Button 
          onClick={onSave} 
          disabled={!hasChanges || isSaving}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </>
  );
};

export default FieldConfigActions;
