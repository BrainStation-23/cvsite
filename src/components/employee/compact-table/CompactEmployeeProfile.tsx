
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, IdCard, Briefcase, Calendar, Building } from 'lucide-react';
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
    total_experience_years?: number;
    company_experience_years?: number;
    expertise_name?: string;
    general_information?: {
      first_name?: string;
      last_name?: string;
      current_designation?: string;
      profile_image?: string;
    };
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
  // Use the general_information object from the profile if available, otherwise fallback to root level or generalInfo prop
  const firstName = generalInfo?.first_name || 
                   profile.general_information?.first_name || 
                   profile.first_name || '';
  const lastName = generalInfo?.last_name || 
                  profile.general_information?.last_name || 
                  profile.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'N/A';
  
  const profileImage = generalInfo?.profile_image || 
                      profile.general_information?.profile_image || 
                      profile.profile_image;
  
  const currentDesignation = generalInfo?.current_designation || 
                            profile.general_information?.current_designation || 
                            profile.current_designation || 
                            'No designation';

  const formatExperience = (years: number | undefined | null) => {
    if (years === undefined || years === null) return 'N/A';
    if (years === 0) return '< 1 year';
    return `${Math.floor(years)} year${Math.floor(years) !== 1 ? 's' : ''}`;
  };

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

            {profile.expertise_name && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                    <Building className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{profile.expertise_name}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expertise: {profile.expertise_name}</p>
                </TooltipContent>
              </Tooltip>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>{formatExperience(profile.total_experience_years)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total Experience: {formatExperience(profile.total_experience_years)}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3 flex-shrink-0" />
                    <span>{formatExperience(profile.company_experience_years)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Company Experience: {formatExperience(profile.company_experience_years)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
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
