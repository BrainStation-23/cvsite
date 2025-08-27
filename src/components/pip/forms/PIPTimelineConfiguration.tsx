
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DatePicker from '@/components/admin/user/DatePicker';
import { AlertTriangle, Clock } from 'lucide-react';

interface PIPTimelineConfigurationProps {
  startDate: string;
  midDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onMidDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  errors?: {
    start_date?: string;
    mid_date?: string;
    end_date?: string;
  };
}

export const PIPTimelineConfiguration: React.FC<PIPTimelineConfigurationProps> = ({
  startDate,
  midDate,
  endDate,
  onStartDateChange,
  onMidDateChange,
  onEndDateChange,
  errors
}) => {
  const isTimelineComplete = startDate && endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`w-3 h-3 rounded-full ${isTimelineComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
          Step 2: Configure Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date" className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Start Date *
            </Label>
            <DatePicker
              value={startDate}
              onChange={onStartDateChange}
              placeholder="Select start date"
            />
            {errors?.start_date && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.start_date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mid_date" className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Mid Review Date
            </Label>
            <DatePicker
              value={midDate}
              onChange={onMidDateChange}
              placeholder="Select mid review date"
            />
            {errors?.mid_date && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.mid_date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date" className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              End Date *
            </Label>
            <DatePicker
              value={endDate}
              onChange={onEndDateChange}
              placeholder="Select end date"
            />
            {errors?.end_date && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {errors.end_date}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
