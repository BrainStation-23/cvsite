
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, ArrowLeft, Calendar, Mail, Building2, Briefcase } from 'lucide-react';
import { usePIPPMFeedback } from '@/hooks/use-pip-pm-feedback';
import { PIPPMFeedbackForm } from '@/components/pip/pm-feedback/PIPPMFeedbackForm';
import { PIPPMFeedbackFormData } from '@/types/pip';

const PIPPMReview: React.FC = () => {
  const { pipId } = useParams<{ pipId: string }>();
  const navigate = useNavigate();
  
  const {
    pipDetails,
    isLoading,
    createPMFeedback,
    updatePMFeedback,
    updatePIPStatus,
    isCreating,
    isUpdating,
    isUpdatingStatus
  } = usePIPPMFeedback(pipId || null);

  const handleSubmitFeedback = async (data: PIPPMFeedbackFormData) => {
    if (!pipDetails) return;

    if (pipDetails.pm_feedback) {
      // Update existing feedback
      updatePMFeedback({ id: pipDetails.pm_feedback.id, updates: data });
    } else {
      // Create new feedback
      createPMFeedback(data);
    }
  };

  const handleSubmitToHR = async () => {
    if (!pipDetails?.pm_feedback) return;
    await updatePIPStatus('hr_review');
    navigate('/pip/list');
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading PIP details...</p>
          </div>
        </div>
    );
  }

  if (!pipDetails) {
    return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">PIP not found</p>
          <Button onClick={() => navigate('/pip/list')} className="mt-4">
            Back to PIP List
          </Button>
        </div>
    );
  }

  const { pip, profile, sbu, expertise, manager, pm_feedback } = pipDetails;
  const isEditing = !!pm_feedback;

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/pip/list')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PIP List
          </Button>
          <UserCheck className="h-8 w-8 text-cvsite-teal" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              PM Review - Performance Improvement Plan
            </h1>
            <p className="text-muted-foreground">
              Review and provide feedback on the PIP for this employee
            </p>
          </div>
        </div>

        {/* Employee Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Employee Information
              <Badge variant="outline" className="ml-auto">
                {pip.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.profile_image || ''} alt={`${profile.first_name} ${profile.last_name}`} />
                <AvatarFallback className="text-lg">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  <p className="text-muted-foreground">{profile.current_designation}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.employee_id}</span>
                  </div>
                  
                  {sbu && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{sbu.name}</span>
                    </div>
                  )}
                  
                  {expertise && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{expertise.name}</span>
                    </div>
                  )}

                  {manager && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{manager.first_name} {manager.last_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIP Details */}
        <Card>
          <CardHeader>
            <CardTitle>PIP Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(pip.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {pip.mid_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Mid Review Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pip.mid_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(pip.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {pip.overall_feedback && (
              <div>
                <p className="text-sm font-medium mb-2">HR Feedback</p>
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: pip.overall_feedback }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* PM Feedback Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Project Manager Feedback</h2>
            {pm_feedback && (
              <Button
                onClick={handleSubmitToHR}
                disabled={isUpdatingStatus}
                className="ml-auto"
              >
                {isUpdatingStatus ? 'Submitting...' : 'Submit to HR'}
              </Button>
            )}
          </div>
          
          <PIPPMFeedbackForm
            initialData={pm_feedback}
            onSubmit={handleSubmitFeedback}
            isSubmitting={isCreating || isUpdating}
            isEditing={isEditing}
          />
          
          {pm_feedback && !isUpdatingStatus && (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitToHR}
                disabled={isUpdatingStatus}
                size="lg"
              >
                Submit to HR for Review
              </Button>
            </div>
          )}
        </div>
      </div>
  );
};

export default PIPPMReview;
