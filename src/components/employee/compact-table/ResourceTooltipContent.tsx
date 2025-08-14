
import React from 'react';
import { Calendar, Clock, Percent } from 'lucide-react';
import { ResourcePlanningInfo } from '@/hooks/types/employee-profiles';
import { ResourceProjectBreakdown } from './ResourceProjectBreakdown';

interface ResourceTooltipContentProps {
  resourcePlanning: ResourcePlanningInfo;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

export const ResourceTooltipContent: React.FC<ResourceTooltipContentProps> = ({
  resourcePlanning
}) => {
  const {
    cumulative_engagement_percent,
    cumulative_billing_percent,
    final_release_date,
    days_until_available,
    breakdown
  } = resourcePlanning;

  const engagementPercent = cumulative_engagement_percent || 0;
  const billingPercent = cumulative_billing_percent || 0;
  const assignmentCount = breakdown?.length || 0;

  return (
    <div className="space-y-3 max-w-sm">
      <div className="font-semibold text-sm border-b pb-2">
        Resource Status Details
      </div>
      
      {/* Summary */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Percent className="h-3 w-3" />
            Total Engagement:
          </span>
          <span className="font-medium">{engagementPercent}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Percent className="h-3 w-3" />
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
              <Clock className="h-3 w-3" />
              Available in:
            </span>
            <span className="font-medium">{days_until_available} days</span>
          </div>
        )}
      </div>

      {/* Active Assignments Breakdown */}
      {assignmentCount > 0 && breakdown ? (
        <ResourceProjectBreakdown breakdown={breakdown} />
      ) : (
        <div className="text-center text-muted-foreground text-xs py-2">
          No active assignments - fully available
        </div>
      )}
    </div>
  );
};
