
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

// Define PIP interface locally since we don't have access to the use-pips hook
export interface PIP {
  id: string;
  employee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Allow for additional properties
}

export interface PIPActionsProps {
  pip: PIP;
  onView: (pip: PIP) => void;
  onEdit?: (pip: PIP) => void;
  onDelete?: (pip: PIP) => void;
  isDeleting: boolean;
}

export const PIPActions: React.FC<PIPActionsProps> = ({
  pip,
  onView,
  onEdit,
  onDelete,
  isDeleting
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(pip)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(pip)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(pip)}
            disabled={isDeleting}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
