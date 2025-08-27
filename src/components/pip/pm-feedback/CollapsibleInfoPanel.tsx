
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Calendar, Mail, Building2, Briefcase, UserCheck } from 'lucide-react';

interface CollapsibleInfoPanelProps {
  profile: {
    first_name: string;
    last_name: string;
    current_designation: string;
    employee_id: string;
  };
  pip: {
    start_date: string;
    mid_date?: string;
    end_date: string;
    overall_feedback?: string;
  };
  sbu?: { name: string };
  expertise?: { name: string };
  manager?: { first_name: string; last_name: string };
}

export const CollapsibleInfoPanel: React.FC<CollapsibleInfoPanelProps> = ({
  profile,
  pip,
  sbu,
  expertise,
  manager
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-medium">Employee & PIP Details</h3>
            <div className="flex gap-2">
              {sbu && (
                <Badge variant="secondary" className="text-xs">
                  {sbu.name}
                </Badge>
              )}
              {expertise && (
                <Badge variant="secondary" className="text-xs">
                  {expertise.name}
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                More
              </>
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(pip.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {pip.mid_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium">Mid Review</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pip.mid_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(pip.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{profile.employee_id}</span>
              </div>
              
              {sbu && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{sbu.name}</span>
                </div>
              )}
              
              {expertise && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{expertise.name}</span>
                </div>
              )}

              {manager && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{manager.first_name} {manager.last_name}</span>
                </div>
              )}
            </div>

            {pip.overall_feedback && (
              <div>
                <p className="text-xs font-medium mb-2">HR Feedback</p>
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground text-sm p-3 bg-muted/30 rounded-md"
                  dangerouslySetInnerHTML={{ __html: pip.overall_feedback }}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
