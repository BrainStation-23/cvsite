
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';

interface ResourcePlanningData {
  id: string;
  profile_id: string;
  engagement_percentage: number;
  release_date: string;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    employee_id: string;
    first_name: string;
    last_name: string;
    current_designation: string;
  };
  resource_type: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    project_name: string;
    project_manager: string;
    client_name: string;
    budget: number;
  };
}

interface ResourcePlanningTableRowProps {
  item: ResourcePlanningData;
}

export const ResourcePlanningTableRow: React.FC<ResourcePlanningTableRowProps> = ({ item }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">
            {item.profile.first_name} {item.profile.last_name}
          </div>
          <div className="text-sm text-muted-foreground">
            {item.profile.employee_id} • {item.profile.current_designation}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {item.resource_type ? (
          <Badge variant="secondary">{item.resource_type.name}</Badge>
        ) : (
          <span className="text-muted-foreground">Not assigned</span>
        )}
      </TableCell>
      <TableCell>
        {item.project ? (
          <div>
            <div className="font-medium">{item.project.project_name}</div>
            <div className="text-sm text-muted-foreground">
              {item.project.client_name} • {formatCurrency(item.project.budget)}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Not assigned</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {item.engagement_percentage}%
        </Badge>
      </TableCell>
      <TableCell>
        {formatDate(item.release_date)}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            Remove
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
