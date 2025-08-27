
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, FileText, Mail } from 'lucide-react';
import { usePIPPMFeedback } from '@/hooks/use-pip-pm-feedback';
import { PIPStatusTimeline } from '@/components/pip/admin/PIPStatusTimeline';
import { PIPOverviewCard } from '@/components/pip/admin/PIPOverviewCard';
import { EmployeeProfileSummary } from '@/components/pip/admin/EmployeeProfileSummary';
import { PIPFeedbackDisplay } from '@/components/pip/admin/PIPFeedbackDisplay';
import { ResourcePlanningOverview } from '@/components/pip/ResourcePlanningOverview';
import { AdminActionsPanel } from '@/components/pip/admin/AdminActionsPanel';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const AdminPIPView: React.FC = () => {
  const { pipId } = useParams<{ pipId: string }>();
  const navigate = useNavigate();
  
  const { pipDetails, isLoading, error } = usePIPPMFeedback(pipId || null);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
      </DashboardLayout>
      
    );
  }

  if (error || !pipDetails) {
    return (
      <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/pip')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to PIP List
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="text-destructive text-lg mb-2">Error Loading PIP</div>
          <p className="text-muted-foreground">
            {error ? 'Failed to load PIP details' : 'PIP not found'}
          </p>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  const { pip, profile, pm_feedback } = pipDetails;
  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Employee';

  return (
    <DashboardLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/pip/list')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to PIP List
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Performance Improvement Plan</h1>
            <p className="text-muted-foreground">
              {fullName} • Employee ID: {profile.employee_id || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/pip/edit/${pipId}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit PIP
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Status Timeline */}
      <PIPStatusTimeline 
        status={pip.status}
        startDate={pip.start_date}
        midDate={pip.mid_date}
        endDate={pip.end_date}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <PIPOverviewCard pip={pip} />
          <PIPFeedbackDisplay 
            overallFeedback={pip.overall_feedback}
            finalReview={pip.final_review}
            pmFeedback={pm_feedback}
          />
          <ResourcePlanningOverview resourcePlanning={profile.resource_planning || []} />
        </div>

        {/* Right Column - Employee & Actions */}
        <div className="space-y-6">
          <EmployeeProfileSummary 
            profile={profile}
            sbu={pipDetails.sbu}
            expertise={pipDetails.expertise}
            manager={pipDetails.manager}
          />
          <AdminActionsPanel 
            pipId={pip.id}
            status={pip.status}
            profileId={pip.profile_id}
          />
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default AdminPIPView;
