
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

interface CompactActionButtonsProps {
  profile: any;
  onViewProfile: (profileId: string) => void;
  onSendEmail: (profile: any) => void;
  onNotesClick?: (profile: any) => void;
}

const CompactActionButtons: React.FC<CompactActionButtonsProps> = ({
  profile,
  onViewProfile,
  onSendEmail,
  onNotesClick
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1">
        {/* Primary Action - View Profile */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onViewProfile(profile.id)}
              className="h-8 w-8 p-0 hover:bg-primary/10"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Profile</p>
          </TooltipContent>
        </Tooltip>

        {/* Secondary Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => onSendEmail(profile)}
              disabled={!profile.email}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            {onNotesClick && (
              <DropdownMenuItem onClick={() => onNotesClick(profile)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                View/Add Notes
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};

export default CompactActionButtons;
