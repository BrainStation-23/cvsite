import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ResourceAssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
  onAssign: (assignment: any) => void;
}

export const ResourceAssignmentForm: React.FC<ResourceAssignmentFormProps> = ({
  isOpen,
  onClose,
  employee,
  onAssign
}) => {
  const [projectName, setProjectName] = useState('');
  const [role, setRole] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [engagementPercentage, setEngagementPercentage] = useState('');
  const [billingPercentage, setBillingPercentage] = useState('');

  const handleStartDateSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setStartDate(date);
    }
  };

  const handleEndDateSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setEndDate(date);
    }
  };

  const handleSubmit = () => {
    if (!projectName || !role || !startDate || !endDate || !engagementPercentage || !billingPercentage) {
      alert('Please fill in all fields.');
      return;
    }

    const assignment = {
      employeeId: employee.id,
      projectName,
      role,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      engagementPercentage: parseInt(engagementPercentage, 10),
      billingPercentage: parseInt(billingPercentage, 10),
    };

    onAssign(assignment);
    onClose();
  };

  return (
    <Card className={cn("w-[600px]", !isOpen && "hidden")}>
      <CardHeader>
        <CardTitle>Assign Resource to Project</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateSelect}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="engagementPercentage">Engagement (%)</Label>
            <Input
              id="engagementPercentage"
              type="number"
              value={engagementPercentage}
              onChange={(e) => setEngagementPercentage(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="billingPercentage">Billing (%)</Label>
            <Input
              id="billingPercentage"
              type="number"
              value={billingPercentage}
              onChange={(e) => setBillingPercentage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Assign</Button>
        </div>
      </CardContent>
    </Card>
  );
};
