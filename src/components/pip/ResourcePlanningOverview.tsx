
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building2, User, Percent, Clock } from 'lucide-react';
import { ResourcePlanningItem } from '@/types/pip';

interface ResourcePlanningOverviewProps {
  resourcePlanning: ResourcePlanningItem[];
}

export const ResourcePlanningOverview: React.FC<ResourcePlanningOverviewProps> = ({ 
  resourcePlanning 
}) => {
  const currentProjects = resourcePlanning.filter(rp => rp.is_current);
  const recentProjects = resourcePlanning.filter(rp => !rp.is_current).slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const ProjectCard = ({ project, isCurrent = true }: { project: ResourcePlanningItem; isCurrent?: boolean }) => (
    <div className={`p-4 rounded-lg border ${isCurrent ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">
            {project.project_name || 'Unnamed Project'}
          </h4>
          {project.client_name && (
            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
              <Building2 className="h-3 w-3" />
              {project.client_name}
            </p>
          )}
        </div>
        <Badge variant={isCurrent ? "default" : "secondary"} className="text-xs">
          {isCurrent ? 'Active' : 'Completed'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-sm">
          <span className="flex items-center gap-1 text-gray-600 mb-1">
            <Percent className="h-3 w-3" />
            Engagement
          </span>
          <span className="font-semibold text-green-700">{project.engagement_percentage}%</span>
        </div>
        <div className="text-sm">
          <span className="flex items-center gap-1 text-gray-600 mb-1">
            <Percent className="h-3 w-3" />
            Billing
          </span>
          <span className="font-semibold text-blue-700">{project.billing_percentage}%</span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Started: {formatDate(project.engagement_start_date)}
        </div>
        {project.release_date && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isCurrent ? 'Expected End' : 'Ended'}: {formatDate(project.release_date)}
          </div>
        )}
        {project.project_manager && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            PM: {project.project_manager}
          </div>
        )}
        {project.bill_type_name && (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs px-2 py-0">
              {project.bill_type_name}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );

  if (resourcePlanning.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-gray-600" />
            Resource Planning Overview (Last 3 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No resource planning data found for the last 3 months</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-gray-600" />
          Resource Planning Overview (Last 3 Months)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Projects */}
        {currentProjects.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Active Projects ({currentProjects.length})
            </h3>
            <div className="grid gap-3">
              {currentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} isCurrent={true} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              Recent Completed Projects
            </h3>
            <div className="grid gap-3">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} isCurrent={false} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
