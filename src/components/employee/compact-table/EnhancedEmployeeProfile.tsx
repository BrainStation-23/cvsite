
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

interface EnhancedEmployeeProfileProps {
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    employee_id?: string;
    email?: string;
    general_information?: {
      first_name?: string;
      last_name?: string;
      current_designation?: string;
      profile_image?: string;
    };
  };
}

const EnhancedEmployeeProfile: React.FC<EnhancedEmployeeProfileProps> = ({
  profile
}) => {
  const firstName = profile.general_information?.first_name || profile.first_name || '';
  const lastName = profile.general_information?.last_name || profile.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'N/A';
  const profileImage = profile.general_information?.profile_image;
  const currentDesignation = profile.general_information?.current_designation || '';

  return (
    <TooltipProvider>
      <div className="flex items-start gap-3 min-w-0">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={profileImage || undefined} alt={fullName} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Name and Employee ID */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground truncate">
                {fullName}
              </h3>
              {profile.employee_id && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 flex items-center gap-1">
                      <IdCard className="h-3 w-3" />
                      {profile.employee_id}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Employee ID</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            
            {/* Designation */}
            {currentDesignation && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{currentDesignation}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current Designation</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* Email */}
          {profile.email && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
    </TooltipProvider>
  );
};

export default EnhancedEmployeeProfile;
