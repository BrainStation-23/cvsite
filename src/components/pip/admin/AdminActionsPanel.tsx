
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog';
import { usePIPPMFeedback } from '@/hooks/use-pip-pm-feedback';
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

const getNextStatus = (currentStatus: string): string | null => {
  const statusFlow = {
    hr_initiation: 'pm_feedback',
    pm_feedback: 'hr_review',
    hr_review: 'ld_goal_setting',
    ld_goal_setting: 'mid_review',
    mid_review: 'final_review',
    final_review: null
  };
  return statusFlow[currentStatus as keyof typeof statusFlow] || null;
};

const getStatusLabel = (status: string): string => {
  const labels = {
    hr_initiation: 'HR Initiation',
    pm_feedback: 'PM Feedback',
    hr_review: 'HR Review',
    ld_goal_setting: 'Goal Setting',
    mid_review: 'Mid Review',
    final_review: 'Final Review'
  };
  return labels[status as keyof typeof labels] || status;
};

export const AdminActionsPanel: React.FC<AdminActionsPanelProps> = ({
  pipId,
  status,
  profileId
}) => {
  const navigate = useNavigate();
  const { updatePIPStatus, isUpdatingStatus } = usePIPPMFeedback(pipId);
  const { isOpen, config, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationDialog();
  const availableActions = statusActions[status] || [];
  const nextStatus = getNextStatus(status);

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        navigate(`/pip/edit/${pipId}`);
        break;
      case 'delete':
        showConfirmation({
          title: 'Delete PIP',
          description: 'Are you sure you want to delete this Performance Improvement Plan? This action cannot be undone.',
          confirmText: 'Delete',
          cancelText: 'Cancel',
          variant: 'destructive',
          onConfirm: () => {
            console.log('Delete PIP:', pipId);
            // TODO: Implement delete functionality
          }
        });
        break;
      case 'advance':
        if (nextStatus) {
          showConfirmation({
            title: 'Advance PIP Status',
            description: `Are you sure you want to advance this PIP from "${getStatusLabel(status)}" to "${getStatusLabel(nextStatus)}"?`,
            confirmText: 'Advance',
            cancelText: 'Cancel',
            variant: 'default',
            onConfirm: () => {
              updatePIPStatus(nextStatus as 'hr_initiation' | 'pm_feedback' | 'hr_review' | 'ld_goal_setting' | 'mid_review' | 'final_review');
            }
          });
        }
        break;
      case 'remind':
        console.log('Send reminder for:', pipId);
        break;
      case 'schedule':
        console.log('Schedule meeting for:', pipId);
        break;
      case 'complete':
        showConfirmation({
          title: 'Complete PIP',
          description: 'Are you sure you want to mark this PIP as complete? This will finalize the performance improvement process.',
          confirmText: 'Complete',
          cancelText: 'Cancel',
          variant: 'default',
          onConfirm: () => {
            console.log('Complete PIP:', pipId);
            // TODO: Implement completion workflow
          }
        });
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <>
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

            {availableActions.includes('advance') && nextStatus && (
              <Button
                onClick={() => handleAction('advance')}
                className="w-full flex items-center gap-2"
                variant="secondary"
                disabled={isUpdatingStatus}
              >
                <UserCheck className="h-4 w-4" />
                {isUpdatingStatus ? 'Advancing...' : `Advance to ${getStatusLabel(nextStatus)}`}
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
      </div>

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={config?.title || ''}
        description={config?.description || ''}
        confirmText={config?.confirmText}
        cancelText={config?.cancelText}
        variant={config?.variant}
      />
    </>
  );
};
