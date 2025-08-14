
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Calendar,
  Info
} from 'lucide-react';
import { ResourcePlanningInfo } from '@/hooks/types/employee-profiles';
import { ResourceStatusBadge } from './ResourceStatusBadge';
import { ResourceProjectBreakdown } from './ResourceProjectBreakdown';

interface CompactResourcePlanningProps {
  resourcePlanning?: ResourcePlanningInfo;
  className?: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const CompactResourcePlanning: React.FC<CompactResourcePlanningProps> = ({
  resourcePlanning,
  className = ''
}) => {
  if (!resourcePlanning) {
    return (
      <div className={`flex flex-col gap-1 text-xs ${className}`}>
        <ResourceStatusBadge engagementPercent={0} />
        <div className="text-muted-foreground">Engagement: 0% | Billing: 0%</div>
        <div className="text-muted-foreground">Release: N/A</div>
        <Button variant="outline" size="sm" disabled className="h-6 text-xs">
          No Details
        </Button>
      </div>
    );
  }

  const {
    cumulative_engagement_percent,
    cumulative_billing_percent,
    final_release_date,
    days_until_available,
    breakdown
  } = resourcePlanning;

  const engagementPercent = cumulative_engagement_percent || 0;
  const billingPercent = cumulative_billing_percent || 0;
  const hasBreakdown = breakdown && breakdown.length > 0;

  return (
    <div className={`flex flex-col gap-1 text-xs ${className}`}>
      {/* 1. Engagement Status Chip */}
      <ResourceStatusBadge engagementPercent={engagementPercent} />

      {/* 2. Engagement Percent | Billing Percent */}
      <div className="text-muted-foreground">
        Engagement: {engagementPercent}% | Billing: {billingPercent}%
      </div>

      {/* 3. Release Date (days_until_available) */}
      <div className="flex items-center gap-1 text-muted-foreground">
        <Calendar className="h-3 w-3" />
        <span>
          Release: {formatDate(final_release_date)}
          {days_until_available > 0 && ` (${days_until_available}d)`}
        </span>
      </div>

      {/* 4. Breakdown Button */}
      {hasBreakdown ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 text-xs">
              <Info className="h-3 w-3 mr-1" />
              View Details ({breakdown.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="p-3 max-w-md">
            <div className="space-y-3 max-w-sm">
              <div className="font-semibold text-sm border-b pb-2">
                Resource Status Details
              </div>
              
              {/* Summary */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Total Engagement:
                  </span>
                  <span className="font-medium">{engagementPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Total Billing:
                  </span>
                  <span className="font-medium">{billingPercent}%</span>
                </div>
                {final_release_date && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Final Release:
                    </span>
                    <span className="font-medium">{formatDate(final_release_date)}</span>
                  </div>
                )}
                {days_until_available > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Available in:
                    </span>
                    <span className="font-medium">{days_until_available} days</span>
                  </div>
                )}
              </div>

              {/* Active Assignments Breakdown */}
              <ResourceProjectBreakdown breakdown={breakdown} />
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Button variant="outline" size="sm" disabled className="h-6 text-xs">
          No Active Projects
        </Button>
      )}
    </div>
  );
};

export default CompactResourcePlanning;
