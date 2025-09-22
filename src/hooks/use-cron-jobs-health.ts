import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CronJobConfig {
  id: string;
  job_name: string;
  function_name: string;
  schedule: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CronJobExecution {
  jobid: number;
  runid: bigint;
  job_pid: number;
  database: string;
  username: string;
  command: string;
  status: string;
  return_message: string;
  start_time: string;
  end_time: string;
}

export interface CronJobHealth {
  config: CronJobConfig;
  executions: CronJobExecution[];
  lastRun?: CronJobExecution;
  nextRun?: string;
  successRate: number;
  isHealthy: boolean;
}

export const useCronJobsHealth = () => {
  // Fetch cron job configurations
  const { data: configs, isLoading: configsLoading, error: configsError } = useQuery({
    queryKey: ['cron-job-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_job_configs')
        .select('*')
        .order('job_name');
      
      if (error) {
        console.error('Error fetching cron job configs:', error);
        throw error;
      }
      
      return data as CronJobConfig[];
    },
  });

  // Fetch cron job executions - mock data for now since cron tables might not be accessible
  const { data: executions, isLoading: executionsLoading, error: executionsError } = useQuery({
    queryKey: ['cron-job-executions'],
    queryFn: async () => {
      // For now, return empty array since cron tables are not accessible through Supabase client
      // In a real implementation, this would need a custom RPC function or direct database access
      console.log('Cron execution history would be fetched here');
      return [] as CronJobExecution[];
    },
    retry: 1,
  });

  // Fetch active cron jobs - mock data for now
  const { data: activeJobs, isLoading: activeJobsLoading, error: activeJobsError } = useQuery({
    queryKey: ['active-cron-jobs'],
    queryFn: async () => {
      // For now, return empty array since cron tables are not accessible through Supabase client
      console.log('Active cron jobs would be fetched here');
      return [];
    },
    retry: 1,
  });

  // Calculate next run time based on cron schedule
  const calculateNextRun = (schedule: string): string => {
    try {
      // This is a simplified calculation - in a real app you'd use a cron parser library
      const now = new Date();
      const nextRun = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour as placeholder
      return nextRun.toISOString();
    } catch {
      return '';
    }
  };

  // Calculate success rate from last 10 runs
  const calculateSuccessRate = (jobExecutions: CronJobExecution[]): number => {
    if (!jobExecutions || jobExecutions.length === 0) return 0;
    
    const recentRuns = jobExecutions.slice(0, 10);
    const successfulRuns = recentRuns.filter(run => run.status === 'succeeded').length;
    return Math.round((successfulRuns / recentRuns.length) * 100);
  };

  // Combine configurations with execution data
  const healthData: CronJobHealth[] = (configs || []).map(config => {
    const jobExecutions = (executions || []).filter(
      exec => exec.command?.includes(config.function_name)
    ).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    const lastRun = jobExecutions[0];
    const successRate = calculateSuccessRate(jobExecutions);
    const nextRun = config.is_enabled ? calculateNextRun(config.schedule) : undefined;
    
    // Determine health status
    const isHealthy = config.is_enabled ? 
      (successRate >= 80 && (!lastRun || lastRun.status === 'succeeded')) :
      true; // Disabled jobs are considered healthy

    return {
      config,
      executions: jobExecutions,
      lastRun,
      nextRun,
      successRate,
      isHealthy
    };
  });

  // Calculate overall statistics
  const totalJobs = configs?.length || 0;
  const enabledJobs = configs?.filter(c => c.is_enabled).length || 0;
  const healthyJobs = healthData.filter(h => h.isHealthy).length;
  const recentFailures = healthData.filter(h => 
    h.lastRun && h.lastRun.status === 'failed'
  ).length;

  return {
    healthData,
    configs,
    executions,
    activeJobs,
    isLoading: configsLoading || executionsLoading || activeJobsLoading,
    error: configsError || executionsError || activeJobsError,
    stats: {
      total: totalJobs,
      enabled: enabledJobs,
      disabled: totalJobs - enabledJobs,
      healthy: healthyJobs,
      unhealthy: totalJobs - healthyJobs,
      recentFailures
    }
  };
};