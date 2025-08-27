
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { PIP } from '@/types/pip';

interface PIPActionsProps {
  pip: PIP;
  onEdit: (pip: PIP) => void;
  onDelete: (pip: PIP) => void;
  onView: (pip: PIP) => void;
  isDeleting?: boolean;
}

export const PIPActions: React.FC<PIPActionsProps> = ({
  pip,
  onEdit,
  onDelete,
  onView,
  isDeleting = false
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
          disabled={isDeleting}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onView(pip)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(pip)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit PIP
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(pip)}
          className="text-red-600 focus:text-red-600"
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete PIP
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
