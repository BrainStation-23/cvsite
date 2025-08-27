
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText } from 'lucide-react';

interface PIPOverviewCardProps {
  pip: {
    id: string;
    status: string;
    start_date: string;
    mid_date: string | null;
    end_date: string;
    created_at: string;
    updated_at: string;
  };
}

const statusLabels: Record<string, string> = {
  hr_initiation: 'HR Initiation',
  pm_feedback: 'PM Feedback Pending',
  hr_review: 'HR Review',
  ld_goal_setting: 'Goal Setting',
  mid_review: 'Mid Review',
  final_review: 'Final Review'
};

const statusColors: Record<string, string> = {
  hr_initiation: 'bg-yellow-100 text-yellow-800',
  pm_feedback: 'bg-orange-100 text-orange-800',
  hr_review: 'bg-blue-100 text-blue-800',
  ld_goal_setting: 'bg-purple-100 text-purple-800',
  mid_review: 'bg-indigo-100 text-indigo-800',
  final_review: 'bg-green-100 text-green-800'
};

export const PIPOverviewCard: React.FC<PIPOverviewCardProps> = ({ pip }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = () => {
    const endDate = new Date(pip.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PIP Overview
          </CardTitle>
          <Badge className={statusColors[pip.status] || 'bg-gray-100 text-gray-800'}>
            {statusLabels[pip.status] || pip.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Start Date
            </div>
            <p className="font-medium">{formatDate(pip.start_date)}</p>
          </div>
          
          {pip.mid_date && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Mid Review
              </div>
              <p className="font-medium">{formatDate(pip.mid_date)}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              End Date
            </div>
            <p className="font-medium">{formatDate(pip.end_date)}</p>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className={`text-2xl font-bold ${daysRemaining <= 7 ? 'text-destructive' : daysRemaining <= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                {daysRemaining > 0 ? daysRemaining : 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">PIP ID</p>
              <p className="font-mono text-sm">{pip.id.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Created:</span>
            <p>{formatDate(pip.created_at)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Last Updated:</span>
            <p>{formatDate(pip.updated_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
