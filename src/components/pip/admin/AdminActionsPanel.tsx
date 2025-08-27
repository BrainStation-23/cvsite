
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Edit, 
  Trash2, 
  FileText, 
  Mail, 
  Calendar,
  UserCheck,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminActionsPanelProps {
  pipId: string;
  status: string;
  profileId: string;
}

const statusActions: Record<string, string[]> = {
  hr_initiation: ['edit', 'delete', 'advance'],
  pm_feedback: ['edit', 'remind', 'advance'],
  hr_review: ['edit', 'advance'],
  ld_goal_setting: ['edit', 'advance'],
  mid_review: ['edit', 'schedule', 'advance'],
  final_review: ['edit', 'complete']
};

export const AdminActionsPanel: React.FC<AdminActionsPanelProps> = ({
  pipId,
  status,
  profileId
}) => {
  const navigate = useNavigate();
  const availableActions = statusActions[status] || [];

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        navigate(`/admin/pip/edit/${pipId}`);
        break;
      case 'delete':
        // TODO: Implement delete confirmation dialog
        console.log('Delete PIP:', pipId);
        break;
      case 'advance':
        // TODO: Implement status advancement
        console.log('Advance PIP status:', pipId);
        break;
      case 'remind':
        // TODO: Implement reminder email
        console.log('Send reminder for:', pipId);
        break;
      case 'schedule':
        // TODO: Implement meeting scheduling
        console.log('Schedule meeting for:', pipId);
        break;
      case 'complete':
        // TODO: Implement completion workflow
        console.log('Complete PIP:', pipId);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableActions.includes('edit') && (
            <Button
              onClick={() => handleAction('edit')}
              className="w-full flex items-center gap-2"
              variant="default"
            >
              <Edit className="h-4 w-4" />
              Edit PIP
            </Button>
          )}

          {availableActions.includes('advance') && (
            <Button
              onClick={() => handleAction('advance')}
              className="w-full flex items-center gap-2"
              variant="secondary"
            >
              <UserCheck className="h-4 w-4" />
              Advance to Next Stage
            </Button>
          )}

          {availableActions.includes('remind') && (
            <Button
              onClick={() => handleAction('remind')}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Mail className="h-4 w-4" />
              Send Reminder
            </Button>
          )}

          {availableActions.includes('schedule') && (
            <Button
              onClick={() => handleAction('schedule')}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Calendar className="h-4 w-4" />
              Schedule Meeting
            </Button>
          )}

          {availableActions.includes('complete') && (
            <Button
              onClick={() => handleAction('complete')}
              className="w-full flex items-center gap-2"
              variant="default"
            >
              <UserCheck className="h-4 w-4" />
              Mark Complete
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Email Stakeholders
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            View Change History
          </Button>

          {availableActions.includes('delete') && (
            <Button
              onClick={() => handleAction('delete')}
              variant="destructive"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete PIP
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Status Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Status:</span>
              <Badge variant="secondary">{status.replace('_', ' ').toUpperCase()}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>PIP ID: {pipId.slice(0, 8)}...</p>
              <p>Profile ID: {profileId.slice(0, 8)}...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
