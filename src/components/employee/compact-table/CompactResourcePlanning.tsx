
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  TrendingUp, 
  Building2,
  Clock
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ResourcePlanningData {
  availability_status?: string;
  current_project?: {
    project_name?: string;
    client_name?: string;
  };
  engagement_percentage?: number;
  billing_percentage?: number;
  release_date?: string;
  days_until_available?: number;
}

interface CompactResourcePlanningProps {
  resourcePlanning?: ResourcePlanningData;
}

const CompactResourcePlanning: React.FC<CompactResourcePlanningProps> = ({
  resourcePlanning
}) => {
  const getAvailabilityBadge = (resourcePlanningData?: ResourcePlanningData) => {
    const status = resourcePlanningData?.availability_status || 'available';
    const variant = status === 'available' ? 'default' : status === 'engaged' ? 'secondary' : 'outline';
    const color = status === 'available' ? 'text-green-700 bg-green-50 border-green-200' : 
                  status === 'engaged' ? 'text-orange-700 bg-orange-50 border-orange-200' : 
                  'text-gray-700 bg-gray-50 border-gray-200';
    
    return (
      <Badge variant={variant} className={`${color} text-xs`}>
        {status === 'available' ? 'Available' : status === 'engaged' ? 'Engaged' : 'Unknown'}
      </Badge>
    );
  };

  const formatReleaseDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  if (!resourcePlanning) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No resource planning data
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {/* Availability Status */}
        <div className="flex items-center gap-2">
          {getAvailabilityBadge(resourcePlanning)}
        </div>
        
        {/* Current Project */}
        {resourcePlanning.current_project && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm">
                <Building2 className="h-3 w-3 text-blue-600" />
                <span className="truncate max-w-[150px]">
                  {resourcePlanning.current_project.project_name}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <div className="font-medium">{resourcePlanning.current_project.project_name}</div>
                {resourcePlanning.current_project.client_name && (
                  <div className="text-xs text-gray-600">Client: {resourcePlanning.current_project.client_name}</div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Engagement & Billing Percentages */}
        {resourcePlanning.engagement_percentage && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp className="h-3 w-3" />
            <span>
              Eng: {resourcePlanning.engagement_percentage}%
              {resourcePlanning.billing_percentage && (
                ` | Bill: ${resourcePlanning.billing_percentage}%`
              )}
            </span>
          </div>
        )}
        
        {/* Release Date */}
        {resourcePlanning.release_date && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>Release: {formatReleaseDate(resourcePlanning.release_date)}</span>
          </div>
        )}
        
        {/* Days Until Available */}
        {resourcePlanning.days_until_available && resourcePlanning.days_until_available > 0 && (
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <Clock className="h-3 w-3" />
            <span>{resourcePlanning.days_until_available} days until available</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CompactResourcePlanning;
