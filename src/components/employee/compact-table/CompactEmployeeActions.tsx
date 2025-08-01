
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Mail, MessageSquare, MoreHorizontal } from 'lucide-react';

interface CompactEmployeeActionsProps {
  profile: any;
  onViewProfile: (profileId: string) => void;
  onSendEmail: (profile: any) => void;
  onNotesClick: (profile: any) => void;
}

const CompactEmployeeActions: React.FC<CompactEmployeeActionsProps> = ({
  profile,
  onViewProfile,
  onSendEmail,
  onNotesClick
}) => {
  return (
    <TooltipProvider>
      <div className="items-center justify-end gap-1">
        {/* Primary Actions - Always Visible */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onViewProfile(profile.id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Profile</p>
          </TooltipContent>
        </Tooltip>

        {/* Secondary Actions - Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onSendEmail(profile)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNotesClick(profile)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              View/Add Notes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};

export default CompactEmployeeActions;
