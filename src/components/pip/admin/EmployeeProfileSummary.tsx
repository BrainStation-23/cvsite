
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Building, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployeeProfileSummaryProps {
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    employee_id: string | null;
    email: string | null;
    profile_image: string | null;
    current_designation: string | null;
    biography: string | null;
  };
  sbu: {
    id: string;
    name: string;
  } | null;
  expertise: {
    id: string;
    name: string;
  } | null;
  manager: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    employee_id: string | null;
  } | null;
}

export const EmployeeProfileSummary: React.FC<EmployeeProfileSummaryProps> = ({
  profile,
  sbu,
  expertise,
  manager
}) => {
  const navigate = useNavigate();
  
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Employee';
  const managerName = manager ? `${manager.first_name || ''} ${manager.last_name || ''}`.trim() : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Employee Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Image & Basic Info */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {profile.profile_image ? (
              <img 
                src={profile.profile_image} 
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{fullName}</h3>
            <p className="text-sm text-muted-foreground">
              ID: {profile.employee_id || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">
              {profile.email || 'No email'}
            </p>
          </div>
        </div>

        {/* Designation & Department */}
        <div className="space-y-3">
          {profile.current_designation && (
            <div>
              <p className="text-sm text-muted-foreground">Current Designation</p>
              <Badge variant="secondary" className="mt-1">
                {profile.current_designation}
              </Badge>
            </div>
          )}

          {sbu && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">SBU</p>
                <p className="font-medium">{sbu.name}</p>
              </div>
            </div>
          )}

          {expertise && (
            <div>
              <p className="text-sm text-muted-foreground">Expertise</p>
              <Badge variant="outline" className="mt-1">
                {expertise.name}
              </Badge>
            </div>
          )}

          {manager && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Reports To</p>
                <p className="font-medium">{managerName}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {manager.employee_id || 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Biography */}
        {profile.biography && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Biography</p>
            <p className="text-sm bg-muted/50 p-3 rounded-lg">
              {profile.biography}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/employee/profile?id=${profile.id}`)}
          className="w-full flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          View Full Profile
        </Button>
      </CardContent>
    </Card>
  );
};
