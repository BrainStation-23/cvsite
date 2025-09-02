
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvancedFilters as AdvancedFiltersType } from '@/types/resource-planning';

interface AdvancedFiltersProps {
  filters: AdvancedFiltersType;
  onFiltersChange: (filters: AdvancedFiltersType) => void;
  onClose: () => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFiltersType>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: AdvancedFiltersType = {
      projectSearch: '',
      minEngagementPercentage: null,
      maxEngagementPercentage: null,
      minBillingPercentage: null,
      maxBillingPercentage: null,
      startDateFrom: null,
      startDateTo: null,
      endDateFrom: null,
      endDateTo: null,
      projectLevelFilter: '',
      projectBillTypeFilter: ''
    };
    setLocalFilters(resetFilters);
  };

  const updateFilter = (key: keyof AdvancedFiltersType, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Project Search</Label>
            <Input
              placeholder="Search projects..."
              value={localFilters.projectSearch || ''}
              onChange={(e) => updateFilter('projectSearch', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Project Level</Label>
            <Input
              placeholder="e.g., Senior, Junior, Lead"
              value={localFilters.projectLevelFilter || ''}
              onChange={(e) => updateFilter('projectLevelFilter', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Project Bill Type</Label>
            <Input
              placeholder="e.g., Fixed, Hourly, Retainer"
              value={localFilters.projectBillTypeFilter || ''}
              onChange={(e) => updateFilter('projectBillTypeFilter', e.target.value)}
            />
          </div>
        </div>

        {/* Percentage Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label>Engagement Percentage Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min %"
                value={localFilters.minEngagementPercentage || ''}
                onChange={(e) => updateFilter('minEngagementPercentage', e.target.value ? parseFloat(e.target.value) : null)}
              />
              <Input
                type="number"
                placeholder="Max %"
                value={localFilters.maxEngagementPercentage || ''}
                onChange={(e) => updateFilter('maxEngagementPercentage', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Billing Percentage Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min %"
                value={localFilters.minBillingPercentage || ''}
                onChange={(e) => updateFilter('minBillingPercentage', e.target.value ? parseFloat(e.target.value) : null)}
              />
              <Input
                type="number"
                placeholder="Max %"
                value={localFilters.maxBillingPercentage || ''}
                onChange={(e) => updateFilter('maxBillingPercentage', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label>Engagement Start Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.startDateFrom ? format(new Date(localFilters.startDateFrom), 'PPP') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.startDateFrom ? new Date(localFilters.startDateFrom) : undefined}
                    onSelect={(date) => updateFilter('startDateFrom', date?.toISOString().split('T')[0] || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.startDateTo ? format(new Date(localFilters.startDateTo), 'PPP') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.startDateTo ? new Date(localFilters.startDateTo) : undefined}
                    onSelect={(date) => updateFilter('startDateTo', date?.toISOString().split('T')[0] || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Release Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.endDateFrom ? format(new Date(localFilters.endDateFrom), 'PPP') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.endDateFrom ? new Date(localFilters.endDateFrom) : undefined}
                    onSelect={(date) => updateFilter('endDateFrom', date?.toISOString().split('T')[0] || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.endDateTo ? format(new Date(localFilters.endDateTo), 'PPP') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.endDateTo ? new Date(localFilters.endDateTo) : undefined}
                    onSelect={(date) => updateFilter('endDateTo', date?.toISOString().split('T')[0] || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset All
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
