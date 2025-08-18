
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, CheckCircle } from 'lucide-react';
import { ResourceCountStatistics } from '@/hooks/use-resource-count-statistics';

interface ResourceStatisticsSummaryProps {
  data: ResourceCountStatistics;
}

export const ResourceStatisticsSummary: React.FC<ResourceStatisticsSummaryProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resources</p>
              <p className="text-2xl font-bold">{data.total_resources}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Engagements</p>
              <p className="text-2xl font-bold">{data.active_engagements}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{data.completed_engagements}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
