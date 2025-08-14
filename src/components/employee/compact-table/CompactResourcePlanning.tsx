
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  Clock
} from 'lucide-react';
import { ResourcePlanningInfo } from '@/hooks/types/employee-profiles';
import { ResourceStatusBadge } from './ResourceStatusBadge';
import { ResourceTooltipContent } from './ResourceTooltipContent';

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
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          Available
        </Badge>
        <span className="text-muted-foreground">0% engaged</span>
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
  const assignmentCount = breakdown?.length || 0;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        {/* Status Badge with Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <ResourceStatusBadge engagementPercent={engagementPercent} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-3">
            <ResourceTooltipContent resourcePlanning={resourcePlanning} />
          </TooltipContent>
        </Tooltip>

        {/* Engagement Percentage - Always Show */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-muted-foreground cursor-help">
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium">{engagementPercent}%</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div>Engagement: {engagementPercent}%</div>
              <div>Billing: {billingPercent}%</div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Days Until Available - Show if applicable */}
        {final_release_date && days_until_available > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-orange-600 cursor-help">
                <Clock className="h-3 w-3" />
                <span>{days_until_available}d</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div>Available in {days_until_available} days</div>
                <div>Release: {formatDate(final_release_date)}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Multiple Projects Indicator */}
        {assignmentCount > 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-xs cursor-help bg-blue-50 text-blue-700 border-blue-200">
                {assignmentCount} projects
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Working on {assignmentCount} active assignments</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CompactResourcePlanning;
