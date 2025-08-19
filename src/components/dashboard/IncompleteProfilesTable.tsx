
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Edit, User } from 'lucide-react';

interface IncompleteProfile {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  missing_sections: string[];
}

interface IncompleteProfilesTableProps {
  data: IncompleteProfile[];
  isLoading?: boolean;
}

const getSectionDisplayName = (section: string) => {
  switch (section) {
    case 'skills':
      return 'Skills';
    case 'experience':
      return 'Experience';
    case 'education':
      return 'Education';
    case 'projects':
      return 'Projects';
    default:
      return section;
  }
};

const getSectionColor = (section: string) => {
  switch (section) {
    case 'skills':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'experience':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'education':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'projects':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const IncompleteProfilesTable: React.FC<IncompleteProfilesTableProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  const handleEditProfile = (profileId: string) => {
    navigate(`/employee/profile/${profileId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cvsite-teal" />
            Incomplete Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading incomplete profiles...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cvsite-teal" />
            Incomplete Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">All profiles are complete! 🎉</p>
              <p className="text-sm mt-1">Every employee has filled out their profile sections.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cvsite-teal" />
            Incomplete Profiles
            <Badge variant="secondary" className="ml-2">
              {data.length} {data.length === 1 ? 'profile' : 'profiles'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-3">
            {data.map((profile) => (
              <div 
                key={profile.id} 
                className="group p-4 border rounded-lg hover:bg-gray-50 hover:border-cvsite-teal/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-cvsite-teal/10 transition-colors">
                      <User className="h-5 w-5 text-gray-500 group-hover:text-cvsite-teal" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {profile.first_name} {profile.last_name}
                        </h4>
                        {profile.employee_id && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {profile.employee_id}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {profile.missing_sections.map((section) => (
                          <Badge 
                            key={section} 
                            variant="secondary"
                            className={`text-xs ${getSectionColor(section)}`}
                          >
                            Missing {getSectionDisplayName(section)}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {profile.missing_sections.length} {profile.missing_sections.length === 1 ? 'section' : 'sections'} incomplete
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditProfile(profile.id)}
                    className="flex items-center gap-1 hover:bg-cvsite-teal hover:text-white hover:border-cvsite-teal transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {data.length > 5 && (
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Showing all {data.length} incomplete profiles
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
