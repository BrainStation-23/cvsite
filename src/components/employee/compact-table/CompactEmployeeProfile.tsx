
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, IdCard, Briefcase } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CompactEmployeeProfileProps {
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    employee_id?: string;
    email?: string;
    profile_image?: string;
    current_designation?: string;
  };
  generalInfo?: {
    first_name?: string;
    last_name?: string;
    current_designation?: string;
    profile_image?: string;
  };
}

const CompactEmployeeProfile: React.FC<CompactEmployeeProfileProps> = ({
  profile,
  generalInfo
}) => {
  const firstName = generalInfo?.first_name || profile.first_name || '';
  const lastName = generalInfo?.last_name || profile.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'N/A';
  const profileImage = generalInfo?.profile_image || profile.profile_image;
  const currentDesignation = generalInfo?.current_designation || 'No designation';

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={profileImage || undefined} alt={fullName} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{fullName}</h3>
            {profile.employee_id && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    <IdCard className="h-3 w-3 mr-1" />
                    {profile.employee_id}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Employee ID</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          <div className="flex flex-col gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <Briefcase className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{currentDesignation}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current Designation: {currentDesignation}</p>
              </TooltipContent>
            </Tooltip>
            
            {profile.email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email: {profile.email}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CompactEmployeeProfile;
