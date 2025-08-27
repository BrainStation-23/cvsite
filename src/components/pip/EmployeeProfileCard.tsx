
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Building2, UserCheck, Briefcase, TrendingUp } from 'lucide-react';
import { ProfileDetails } from '@/types/pip';

interface EmployeeProfileCardProps {
  profile: ProfileDetails;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({ profile }) => {
  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUtilizationLabel = (utilization: number) => {
    if (utilization >= 90) return 'Overutilized';
    if (utilization >= 70) return 'High Utilization';
    if (utilization >= 40) return 'Moderate Utilization';
    return 'Low Utilization';
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <User className="h-5 w-5 text-blue-600" />
          Employee Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero Section */}
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage src={profile.profile_image || undefined} alt={`${profile.first_name} ${profile.last_name}`} />
            <AvatarFallback className="text-xl font-semibold bg-blue-100 text-blue-700">
              {getInitials(profile.first_name, profile.last_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}` 
                  : 'Unknown Employee'
                }
              </h3>
              <p className="text-gray-600 font-medium">
                ID: {profile.employee_id || 'N/A'}
              </p>
            </div>

            {profile.current_designation && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                <Briefcase className="h-3 w-3 mr-1" />
                {profile.current_designation}
              </Badge>
            )}
          </div>

          {/* Utilization Indicator */}
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Current Utilization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getUtilizationColor(profile.total_utilization)}`}></div>
              <span className="text-2xl font-bold text-gray-900">{profile.total_utilization}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getUtilizationLabel(profile.total_utilization)}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">SBU:</span>
              <span className="text-gray-900">{profile.sbu_name || 'N/A'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <UserCheck className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">Manager:</span>
              <span className="text-gray-900">{profile.manager_name || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">Expertise:</span>
              <span className="text-gray-900">{profile.expertise_name || 'N/A'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">Active Projects:</span>
              <span className="text-gray-900">
                {profile.resource_planning.filter(rp => rp.is_current).length}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
