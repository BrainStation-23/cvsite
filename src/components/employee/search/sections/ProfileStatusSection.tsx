
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileStatusSectionProps {
  completionStatus: string;
  onCompletionStatusChange: (status: string) => void;
}

const ProfileStatusSection: React.FC<ProfileStatusSectionProps> = ({
  completionStatus,
  onCompletionStatusChange
}) => {
  return (
    <Card className="border-orange-200 bg-orange-50/30 dark:bg-orange-900/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          Profile Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-orange-700 dark:text-orange-300">Completion Status</Label>
          <Select value={completionStatus} onValueChange={onCompletionStatusChange}>
            <SelectTrigger className="text-xs h-7 w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Profiles</SelectItem>
              <SelectItem value="complete">Complete Profiles</SelectItem>
              <SelectItem value="incomplete">Incomplete Profiles</SelectItem>
              <SelectItem value="no-skills">Missing Skills</SelectItem>
              <SelectItem value="no-experience">Missing Experience</SelectItem>
              <SelectItem value="no-education">Missing Education</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStatusSection;
