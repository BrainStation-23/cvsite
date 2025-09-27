import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Award, Users, Building2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { NonBilledRecord } from './types/non-billed-record-data';
import { NonBilledFeedbackCell } from './NonBilledFeedbackCell';
import { useNonBilledFeedback } from '@/hooks/use-non-billed-feedback';

interface NonBilledTableMobileProps {
  record: NonBilledRecord;
}

export const NonBilledTableMobile: React.FC<NonBilledTableMobileProps> = ({ record }) => {
  const { updateFeedback } = useNonBilledFeedback();
  const formatNonBilledDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getDurationBadge = (days: number) => {
    if (days <= 7) {
      return <Badge className="bg-green-100 text-green-800">{days}d</Badge>;
    } else if (days <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-800">{days}d</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">{days}d</Badge>;
    }
  };

  const getExperienceBadge = (years: number) => {
    if (years < 2) {
      return <Badge variant="outline" className="text-blue-600">Junior</Badge>;
    } else if (years < 5) {
      return <Badge variant="outline" className="text-green-600">Mid-level</Badge>;
    } else {
      return <Badge variant="outline" className="text-purple-600">Senior</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-base">{record.employee_name}</h4>
              <p className="text-sm text-muted-foreground">{record.employee_id}</p>
            </div>
            <Badge 
              variant={record.planned_status === 'planned' ? 'secondary' : 'destructive'}
              className={record.planned_status === 'planned' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
            >
              {record.planned_status === 'planned' ? 'Planned' : 'Unplanned'}
            </Badge>
          </div>

          {/* Expertise and SBU */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{record.expertise}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{record.sbu_name}</Badge>
            </div>
          </div>

          {/* Bill Type */}
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: record.bill_type_color }}
            />
            <span className="text-sm font-medium">Bill Type:</span>
            <span className="text-sm">{record.bill_type_name}</span>
          </div>

          {/* Bench Info */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Non-Billed Date</p>
                  <p className="text-sm font-medium">{formatNonBilledDate(record.non_billed_resources_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <div className="flex items-center gap-1">
                    {getDurationBadge(record.non_billed_resources_duration_days)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{record.total_years_experience}y</span>
                    {getExperienceBadge(record.total_years_experience)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          
          {/* Feedback Section */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Feedback</div>
            <NonBilledFeedbackCell
              employeeId={record.employee_id}
              employeeName={record.employee_name}
              feedback={record.non_billed_resources_feedback}
              onUpdate={updateFeedback}
            />
          </div>
        </CardContent>
      </Card>
    );
};