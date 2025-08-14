
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Users, Percent, Clock, Building2 } from 'lucide-react';
import { ResourcePlanningInfo } from '@/hooks/types/employee-profiles';

interface CompactResourcePlanningEnhancedProps {
  resourcePlanning?: ResourcePlanningInfo;
  className?: string;
}

export const CompactResourcePlanningEnhanced: React.FC<CompactResourcePlanningEnhancedProps> = ({
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
    availability_status,
    days_until_available,
    cumulative_engagement_percent,
    cumulative_billing_percent,
    final_release_date,
    breakdown
  } = resourcePlanning;

  const getStatusBadge = () => {
    const engagementPercent = cumulative_engagement_percent || 0;
    
    if (engagementPercent === 0) {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          Available
        </Badge>
      );
    } else if (engagementPercent >= 100) {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">
          Fully Engaged
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Partially Engaged
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderDetailedTooltip = () => {
    const engagementPercent = cumulative_engagement_percent || 0;
    const billingPercent = cumulative_billing_percent || 0;
    const assignmentCount = breakdown?.length || 0;

    return (
      <div className="space-y-3 max-w-sm">
        <div className="font-semibold text-sm border-b pb-2">
          Resource Status
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

        {/* Active Assignments */}
        {assignmentCount > 0 && (
          <>
            <div className="border-t pt-2">
              <div className="font-semibold text-sm mb-2">
                Active Assignments ({assignmentCount})
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {breakdown?.map((item, index) => (
                  <div key={item.id || index} className="space-y-1 text-xs bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-blue-600" />
                      <span className="font-medium">
                        {item.project_name || 'Unnamed Project'}
                      </span>
                    </div>
                    
                    {item.client_name && (
                      <div className="ml-5 text-muted-foreground">
                        Client: {item.client_name}
                      </div>
                    )}
                    
                    <div className="ml-5 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Percent className="h-2 w-2" />
                        Eng: {item.engagement_percentage}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Percent className="h-2 w-2" />
                        Bill: {item.billing_percentage}%
                      </span>
                    </div>
                    
                    {item.release_date && (
                      <div className="ml-5 flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-2 w-2" />
                        Release: {formatDate(item.release_date)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {assignmentCount === 0 && engagementPercent === 0 && (
          <div className="text-center text-muted-foreground text-xs py-2">
            No active assignments - fully available
          </div>
        )}
      </div>
    );
  };

  const engagementPercent = cumulative_engagement_percent || 0;
  const billingPercent = cumulative_billing_percent || 0;
  const assignmentCount = breakdown?.length || 0;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              {getStatusBadge()}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-3">
            {renderDetailedTooltip()}
          </TooltipContent>
        </Tooltip>

        {/* Main engagement percentage - always show */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-muted-foreground cursor-help">
              <Percent className="h-3 w-3" />
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

        {/* Release date if applicable */}
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

        {/* Multiple assignments indicator */}
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
