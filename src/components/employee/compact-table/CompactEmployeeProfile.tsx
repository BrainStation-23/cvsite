
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, Award } from 'lucide-react';

interface CompactEmployeeProfileProps {
  profile: {
    id: string;
    employee_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    total_experience_years?: number;
    company_experience_years?: number;
    expertise_name?: string;
    general_information?: {
      first_name?: string;
      last_name?: string;
      biography?: string;
      profile_image?: string;
      current_designation?: string;
    };
  };
  generalInfo?: {
    first_name?: string;
    last_name?: string;
    biography?: string;
    profile_image?: string;
    current_designation?: string;
  };
}

const CompactEmployeeProfile: React.FC<CompactEmployeeProfileProps> = ({
  profile,
  generalInfo
}) => {
  const displayFirstName = generalInfo?.first_name || profile.general_information?.first_name || profile.first_name || 'N/A';
  const displayLastName = generalInfo?.last_name || profile.general_information?.last_name || profile.last_name || '';
  const displayName = `${displayFirstName} ${displayLastName}`.trim();
  const designation = generalInfo?.current_designation || profile.general_information?.current_designation;
  const profileImage = generalInfo?.profile_image || profile.general_information?.profile_image;
  
  const initials = `${displayFirstName.charAt(0)}${displayLastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex items-start space-x-3">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={profileImage} alt={displayName} />
        <AvatarFallback className="bg-cvsite-teal/10 text-cvsite-teal font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-foreground truncate">
              {displayName}
            </p>
            {profile.employee_id && (
              <Badge variant="outline" className="text-xs">
                {profile.employee_id}
              </Badge>
            )}
          </div>
          
          {designation && (
            <p className="text-xs text-muted-foreground truncate">
              {designation}
            </p>
          )}
          
          {/* Experience Information */}
          <div className="flex flex-wrap gap-2 mt-1">
            {profile.total_experience_years !== null && profile.total_experience_years !== undefined && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{profile.total_experience_years}y total</span>
              </div>
            )}
            
            {profile.company_experience_years !== null && profile.company_experience_years !== undefined && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{profile.company_experience_years}y here</span>
              </div>
            )}
            
            {profile.expertise_name && (
              <div className="flex items-center space-x-1 text-xs">
                <Award className="h-3 w-3 text-cvsite-teal" />
                <Badge variant="secondary" className="text-xs bg-cvsite-teal/10 text-cvsite-teal">
                  {profile.expertise_name}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactEmployeeProfile;
