import React, { useState } from 'react';
import { useCronJobsHealth, CronJobHealth } from '@/hooks/use-cron-jobs-health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock, PlayCircle, PauseCircle, Activity, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatusIcon = ({ status, isEnabled }: { status?: string; isEnabled: boolean }) => {
  if (!isEnabled) {
    return <PauseCircle className="h-4 w-4 text-muted-foreground" />;
  }
  
  switch (status) {
    case 'succeeded':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case 'running':
      return <PlayCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const HealthBadge = ({ isHealthy, isEnabled }: { isHealthy: boolean; isEnabled: boolean }) => {
  if (!isEnabled) {
    return <Badge variant="secondary">Disabled</Badge>;
  }
  
  return (
    <Badge variant={isHealthy ? "default" : "destructive"}>
      {isHealthy ? "Healthy" : "Unhealthy"}
    </Badge>
  );
};

const JobDetailsModal = ({ job }: { job: CronJobHealth }) => {
  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <StatusIcon status={job.lastRun?.status} isEnabled={job.config.is_enabled} />
          {job.config.job_name}
        </DialogTitle>
        <DialogDescription>
          Detailed information and execution history for this cron job
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Configuration Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Function:</span>
                <span className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">
                  {job.config.function_name}
                </span>
              </div>
              <div>
                <span className="font-medium">Schedule:</span>
                <span className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">
                  {job.config.schedule}
                </span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2">
                  <HealthBadge isHealthy={job.isHealthy} isEnabled={job.config.is_enabled} />
                </span>
              </div>
              <div>
                <span className="font-medium">Success Rate:</span>
                <span className="ml-2">{job.successRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Executions</CardTitle>
            <CardDescription>Last 10 execution attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {job.executions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.executions.slice(0, 10).map((execution, index) => {
                    const duration = execution.end_time && execution.start_time
                      ? Math.round((new Date(execution.end_time).getTime() - new Date(execution.start_time).getTime()) / 1000)
                      : null;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusIcon status={execution.status} isEnabled={true} />
                            <span className="capitalize">{execution.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatDistanceToNow(new Date(execution.start_time), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {duration ? `${duration}s` : '-'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={execution.return_message}>
                          {execution.return_message || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>No execution history available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );
};

const CronJobsSettings: React.FC = () => {
  const { healthData, isLoading, error, stats } = useCronJobsHealth();
  const [selectedJob, setSelectedJob] = useState<CronJobHealth | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Cron Jobs Health
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage scheduled background jobs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Cron Jobs Health
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage scheduled background jobs.
          </p>
        </div>
        
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error loading cron jobs data</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {error?.message || 'Unable to fetch cron jobs information'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Cron Jobs Health
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage scheduled background jobs.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm font-medium text-muted-foreground">Total Jobs</div>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-green-500" />
              <div className="text-sm font-medium text-muted-foreground">Enabled</div>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.enabled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="text-sm font-medium text-muted-foreground">Healthy</div>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div className="text-sm font-medium text-muted-foreground">Recent Failures</div>
            </div>
            <div className="text-2xl font-bold text-destructive">{stats.recentFailures}</div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cron Jobs</CardTitle>
          <CardDescription>
            Status and health information for all configured cron jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthData.map((job) => (
                  <TableRow key={job.config.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={job.lastRun?.status} isEnabled={job.config.is_enabled} />
                        {job.config.job_name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {job.config.schedule}
                    </TableCell>
                    <TableCell>
                      <HealthBadge isHealthy={job.isHealthy} isEnabled={job.config.is_enabled} />
                    </TableCell>
                    <TableCell>
                      {job.lastRun ? (
                        <div className="text-sm">
                          <div>{formatDistanceToNow(new Date(job.lastRun.start_time), { addSuffix: true })}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {job.lastRun.status}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.nextRun ? (
                        formatDistanceToNow(new Date(job.nextRun), { addSuffix: true })
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{job.successRate}%</span>
                        {job.successRate >= 80 ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </DialogTrigger>
                        <JobDetailsModal job={job} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>No cron jobs configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CronJobsSettings;