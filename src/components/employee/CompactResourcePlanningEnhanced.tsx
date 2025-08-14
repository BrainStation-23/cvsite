
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Users, Percent, Clock } from 'lucide-react';
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
        <Badge variant="secondary" className="text-xs">
          Available
        </Badge>
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'engaged':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'partially_engaged':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderBreakdownTooltip = () => {
    if (!breakdown || breakdown.length === 0) {
      return <div>No active assignments</div>;
    }

    return (
      <div className="space-y-3 max-w-sm">
        <div className="font-semibold text-sm border-b pb-2">
          Resource Assignments ({breakdown.length})
        </div>
        
        {breakdown.map((item, index) => (
          <div key={item.id || index} className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span className="font-medium">
                {item.project_name || 'Unnamed Project'}
              </span>
            </div>
            
            <div className="ml-5 space-y-1 text-muted-foreground">
              {item.client_name && (
                <div>Client: {item.client_name}</div>
              )}
              {item.project_manager && (
                <div>PM: {item.project_manager}</div>
              )}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Eng: {item.engagement_percentage}%
                </span>
                <span className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Bill: {item.billing_percentage}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Release: {formatDate(item.release_date)}
              </div>
            </div>
            
            {index < breakdown.length - 1 && (
              <div className="border-b border-gray-200 dark:border-gray-700 mt-2" />
            )}
          </div>
        ))}
        
        {(cumulative_engagement_percent !== null || cumulative_billing_percent !== null) && (
          <>
            <div className="border-t pt-2 mt-3">
              <div className="font-semibold text-sm">Cumulative Totals</div>
              <div className="flex items-center gap-4 text-xs mt-1">
                {cumulative_engagement_percent !== null && (
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Total Eng: {cumulative_engagement_percent}%
                  </span>
                )}
                {cumulative_billing_percent !== null && (
                  <span className="flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Total Bill: {cumulative_billing_percent}%
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`text-xs cursor-help ${getStatusColor(availability_status)}`}
            >
              {availability_status === 'available' ? 'Available' : 
               availability_status === 'engaged' ? 'Engaged' :
               availability_status === 'partially_engaged' ? 'Partial' : 
               availability_status}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-3">
            {renderBreakdownTooltip()}
          </TooltipContent>
        </Tooltip>

        {/* Cumulative Engagement Percentage */}
        {cumulative_engagement_percent !== null && cumulative_engagement_percent > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground cursor-help">
                <Percent className="h-3 w-3" />
                <span>{cumulative_engagement_percent}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total Engagement: {cumulative_engagement_percent}%</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Days until available */}
        {days_until_available > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-muted-foreground cursor-help">
                <Clock className="h-3 w-3" />
                <span>{days_until_available}d</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Available in {days_until_available} days</p>
              {final_release_date && (
                <p>Release date: {formatDate(final_release_date)}</p>
              )}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Multiple projects indicator */}
        {breakdown && breakdown.length > 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-xs cursor-help">
                +{breakdown.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{breakdown.length} active assignments</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
