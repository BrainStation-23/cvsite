import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface OrgChartNodeData {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  email: string;
  isCurrentUser: boolean;
  nodeType: 'current' | 'manager' | 'peer' | 'report';
}

const OrgChartNode = memo(({ data }: { data: OrgChartNodeData }) => {
  const getNodeStyles = () => {
    switch (data.nodeType) {
      case 'current':
        return 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20';
      case 'manager':
        return 'border-blue-500 bg-blue-50 shadow-md';
      case 'report':
        return 'border-green-500 bg-green-50 shadow-md';
      case 'peer':
        return 'border-purple-500 bg-purple-50 shadow-md';
      default:
        return 'border-border bg-card shadow-md';
    }
  };

  const getBadgeColor = () => {
    switch (data.nodeType) {
      case 'current':
        return 'bg-primary text-primary-foreground';
      case 'manager':
        return 'bg-blue-500 text-white';
      case 'report':
        return 'bg-green-500 text-white';
      case 'peer':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNodeTitle = () => {
    switch (data.nodeType) {
      case 'current':
        return 'You';
      case 'manager':
        return 'Manager';
      case 'report':
        return 'Direct Report';
      case 'peer':
        return 'Peer';
      default:
        return '';
    }
  };

  const getInitials = () => {
    return `${data.first_name?.charAt(0) || ''}${data.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Card className={`w-[280px] h-[120px] transition-all duration-200 hover:shadow-lg ${getNodeStyles()}`}>
      <CardContent className="p-4 h-full flex items-center gap-3">
        {/* Handles for connections */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-primary border-2 border-white"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-primary border-2 border-white"
        />

        {/* Avatar */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src="" alt={`${data.first_name} ${data.last_name}`} />
          <AvatarFallback className="text-sm font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">
              {data.first_name} {data.last_name}
            </h3>
            <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${getBadgeColor()}`}>
              {getNodeTitle()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mb-1">
            ID: {data.employee_id}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {data.email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

OrgChartNode.displayName = 'OrgChartNode';

export default OrgChartNode;