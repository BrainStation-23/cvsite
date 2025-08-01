
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, Users, Briefcase, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ResourcePlanningFiltersProps {
  onResourcePlanningFilters: (filters: {
    minEngagementPercentage?: number | null;
    maxEngagementPercentage?: number | null;
    minBillingPercentage?: number | null;
    maxBillingPercentage?: number | null;
    releaseDateFrom?: string | null;
    releaseDateTo?: string | null;
    availabilityStatus?: string | null;
    currentProjectSearch?: string | null;
  }) => void;
  isLoading?: boolean;
}

export const ResourcePlanningFilters: React.FC<ResourcePlanningFiltersProps> = ({
  onResourcePlanningFilters,
  isLoading = false
}) => {
  const [engagementRange, setEngagementRange] = useState<[number, number]>([0, 100]);
  const [billingRange, setBillingRange] = useState<[number, number]>([0, 100]);
  const [releaseDateFrom, setReleaseDateFrom] = useState<Date | undefined>();
  const [releaseDateTo, setReleaseDateTo] = useState<Date | undefined>();
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('all');
  const [projectSearch, setProjectSearch] = useState<string>('');

  const handleApplyFilters = () => {
    onResourcePlanningFilters({
      minEngagementPercentage: engagementRange[0] > 0 ? engagementRange[0] : null,
      maxEngagementPercentage: engagementRange[1] < 100 ? engagementRange[1] : null,
      minBillingPercentage: billingRange[0] > 0 ? billingRange[0] : null,
      maxBillingPercentage: billingRange[1] < 100 ? billingRange[1] : null,
      releaseDateFrom: releaseDateFrom ? format(releaseDateFrom, 'yyyy-MM-dd') : null,
      releaseDateTo: releaseDateTo ? format(releaseDateTo, 'yyyy-MM-dd') : null,
      availabilityStatus: availabilityStatus !== 'all' ? availabilityStatus : null,
      currentProjectSearch: projectSearch.trim() || null
    });
  };

  const handleClearFilters = () => {
    setEngagementRange([0, 100]);
    setBillingRange([0, 100]);
    setReleaseDateFrom(undefined);
    setReleaseDateTo(undefined);
    setAvailabilityStatus('all');
    setProjectSearch('');
    
    onResourcePlanningFilters({
      minEngagementPercentage: null,
      maxEngagementPercentage: null,
      minBillingPercentage: null,
      maxBillingPercentage: null,
      releaseDateFrom: null,
      releaseDateTo: null,
      availabilityStatus: null,
      currentProjectSearch: null
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-cvsite-teal" />
        <h3 className="font-semibold">Resource Planning & Availability</h3>
      </div>

      {/* Availability Status */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Availability Status</Label>
        <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="available">Available Now</SelectItem>
            <SelectItem value="engaged">Currently Engaged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current Project Search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          Current Project
        </Label>
        <Input
          placeholder="Search by current project..."
          value={projectSearch}
          onChange={(e) => setProjectSearch(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Engagement Percentage Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Engagement Percentage: {engagementRange[0]}% - {engagementRange[1]}%
        </Label>
        <Slider
          value={engagementRange}
          onValueChange={(value) => setEngagementRange(value as [number, number])}
          max={100}
          min={0}
          step={5}
          className="w-full"
        />
      </div>

      {/* Billing Percentage Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Billing Percentage: {billingRange[0]}% - {billingRange[1]}%
        </Label>
        <Slider
          value={billingRange}
          onValueChange={(value) => setBillingRange(value as [number, number])}
          max={100}
          min={0}
          step={5}
          className="w-full"
        />
      </div>

      {/* Release Date Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Release Date Range
        </Label>
        
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                <CalendarDays className="mr-2 h-4 w-4" />
                {releaseDateFrom ? format(releaseDateFrom, "MMM dd") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={releaseDateFrom}
                onSelect={setReleaseDateFrom}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                <CalendarDays className="mr-2 h-4 w-4" />
                {releaseDateTo ? format(releaseDateTo, "MMM dd") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={releaseDateTo}
                onSelect={setReleaseDateTo}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button 
          onClick={handleApplyFilters}
          size="sm"
          disabled={isLoading}
          className="flex-1"
        >
          Apply Filters
        </Button>
        <Button 
          onClick={handleClearFilters}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          Clear
        </Button>
      </div>
    </Card>
  );
};
