import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  TrendingUp,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ResourcePlanningFiltersProps {
  minEngagementPercentage: string;
  setMinEngagementPercentage: (value: string) => void;
  maxEngagementPercentage: string;
  setMaxEngagementPercentage: (value: string) => void;
  minBillingPercentage: string;
  setMinBillingPercentage: (value: string) => void;
  maxBillingPercentage: string;
  setMaxBillingPercentage: (value: string) => void;
  releaseDateFrom: Date | null;
  setReleaseDateFrom: (date: Date | null) => void;
  releaseDateTo: Date | null;
  setReleaseDateTo: (date: Date | null) => void;
  availabilityStatus: string;
  setAvailabilityStatus: (status: string) => void;
  currentProjectSearch: string;
  setCurrentProjectSearch: (search: string) => void;
  isResourcePlanningOpen: boolean;
  setIsResourcePlanningOpen: (open: boolean) => void;
}

const ResourcePlanningFilters: React.FC<ResourcePlanningFiltersProps> = ({
  minEngagementPercentage,
  setMinEngagementPercentage,
  maxEngagementPercentage,
  setMaxEngagementPercentage,
  minBillingPercentage,
  setMinBillingPercentage,
  maxBillingPercentage,
  setMaxBillingPercentage,
  releaseDateFrom,
  setReleaseDateFrom,
  releaseDateTo,
  setReleaseDateTo,
  availabilityStatus,
  setAvailabilityStatus,
  currentProjectSearch,
  setCurrentProjectSearch,
  isResourcePlanningOpen,
  setIsResourcePlanningOpen,
}) => {
  const handleReleaseDateFromSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setReleaseDateFrom(date);
    } else {
      setReleaseDateFrom(null);
    }
  };

  const handleReleaseDateToSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setReleaseDateTo(date);
    } else {
      setReleaseDateTo(null);
    }
  };

  return (
    <Collapsible open={isResourcePlanningOpen} onOpenChange={setIsResourcePlanningOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Resource Planning
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isResourcePlanningOpen && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        {/* Availability Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Availability Status</Label>
          <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="engaged">Engaged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Project Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Project</Label>
          <div className="relative">
            <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search current project..."
              value={currentProjectSearch}
              onChange={(e) => setCurrentProjectSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Engagement Percentage Range - Text Inputs */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Engagement Percentage</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Min %</Label>
              <Input
                type="text"
                placeholder="0"
                value={minEngagementPercentage}
                onChange={(e) => setMinEngagementPercentage(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Max %</Label>
              <Input
                type="text"
                placeholder="100"
                value={maxEngagementPercentage}
                onChange={(e) => setMaxEngagementPercentage(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Billing Percentage Range - Text Inputs */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Billing Percentage</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Min %</Label>
              <Input
                type="text"
                placeholder="0"
                value={minBillingPercentage}
                onChange={(e) => setMinBillingPercentage(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Max %</Label>
              <Input
                type="text"
                placeholder="100"
                value={maxBillingPercentage}
                onChange={(e) => setMaxBillingPercentage(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Release Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Release Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !releaseDateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {releaseDateFrom ? format(releaseDateFrom, "PPP") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={releaseDateFrom}
                  onSelect={handleReleaseDateFromSelect}
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !releaseDateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {releaseDateTo ? format(releaseDateTo, "PPP") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={releaseDateTo}
                  onSelect={handleReleaseDateToSelect}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ResourcePlanningFilters;
