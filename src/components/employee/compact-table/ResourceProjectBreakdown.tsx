
import React from 'react';
import { Building2, Calendar, Percent } from 'lucide-react';
import { ResourcePlanningBreakdownItem } from '@/hooks/types/employee-profiles';

interface ResourceProjectBreakdownProps {
  breakdown: ResourcePlanningBreakdownItem[];
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

export const ResourceProjectBreakdown: React.FC<ResourceProjectBreakdownProps> = ({
  breakdown
}) => {
  return (
    <div className="border-t pt-2">
      <div className="font-semibold text-sm mb-2">
        Active Assignments ({breakdown.length})
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {breakdown.map((item, index) => (
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
                Eng: {item.engagement_percentage || 0}%
              </span>
              <span className="flex items-center gap-1">
                <Percent className="h-2 w-2" />
                Bill: {item.billing_percentage || 0}%
              </span>
            </div>
            
            {item.release_date && (
              <div className="ml-5 flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-2 w-2" />
                Release: {formatDate(item.release_date)}
              </div>
            )}
            
            {item.project_manager && (
              <div className="ml-5 text-muted-foreground">
                PM: {item.project_manager}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
