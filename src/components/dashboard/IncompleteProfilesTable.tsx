
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

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
      return 'bg-blue-100 text-blue-800';
    case 'experience':
      return 'bg-green-100 text-green-800';
    case 'education':
      return 'bg-purple-100 text-purple-800';
    case 'projects':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const IncompleteProfilesTable: React.FC<IncompleteProfilesTableProps> = ({ data, isLoading }) => {
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
              <p>All profiles are complete! 🎉</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-cvsite-teal" />
          Incomplete Profiles ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-3">
            {data.map((profile) => (
              <div 
                key={profile.id} 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-sm">
                      {profile.first_name} {profile.last_name}
                    </h4>
                    {profile.employee_id && (
                      <p className="text-xs text-muted-foreground">
                        ID: {profile.employee_id}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
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
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
