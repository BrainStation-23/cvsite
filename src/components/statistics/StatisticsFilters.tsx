
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface StatisticsFiltersProps {
  resourceType: string;
  billType: string;
  expertiseType: string;
  sbu: string;
  startDate: Date | null;
  endDate: Date | null;
  onResourceTypeChange: (value: string) => void;
  onBillTypeChange: (value: string) => void;
  onExpertiseTypeChange: (value: string) => void;
  onSbuChange: (value: string) => void;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onClearFilters: () => void;
}

export const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  resourceType,
  billType,
  expertiseType,
  sbu,
  startDate,
  endDate,
  onResourceTypeChange,
  onBillTypeChange,
  onExpertiseTypeChange,
  onSbuChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="resource-type">Resource Type</Label>
            <Input
              id="resource-type"
              placeholder="Enter resource type..."
              value={resourceType}
              onChange={(e) => onResourceTypeChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bill-type">Bill Type</Label>
            <Input
              id="bill-type"
              placeholder="Enter bill type..."
              value={billType}
              onChange={(e) => onBillTypeChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise-type">Expertise Type</Label>
            <Input
              id="expertise-type"
              placeholder="Enter expertise type..."
              value={expertiseType}
              onChange={(e) => onExpertiseTypeChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sbu">SBU</Label>
            <Input
              id="sbu"
              placeholder="Enter SBU..."
              value={sbu}
              onChange={(e) => onSbuChange(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : 'Select start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={onStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Select end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={onEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
