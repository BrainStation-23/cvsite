import React from 'react';
import { NonBilledMetricType } from '@/hooks/use-non-billed-pivot-statistics';
import { getNonBilledIntensityClass } from '@/lib/nonBilledPivotUtils';
import { cn } from '@/lib/utils';

interface NonBilledPivotCellProps {
  count: number;
  avgDuration: number;
  initialCount: number;
  criticalCount: number;
  primaryMetric: NonBilledMetricType;
  displayMode: 'compact' | 'expanded';
  maxValue: number;
  className?: string;
}

export const NonBilledPivotCell: React.FC<NonBilledPivotCellProps> = ({
  count,
  avgDuration,
  initialCount,
  criticalCount,
  primaryMetric,
  displayMode,
  maxValue,
  className
}) => {
  const metrics = {
    count,
    avg_duration: avgDuration,
    initial_count: initialCount,
    critical_count: criticalCount
  };

  const primaryValue = metrics[primaryMetric];
  const intensityClass = getNonBilledIntensityClass(primaryValue, maxValue);

  if (displayMode === 'compact') {
    return (
      <div 
        className={cn('font-mono text-sm font-medium py-1', intensityClass, className)}
        title={`Count: ${count} | Avg Duration: ${avgDuration.toFixed(1)}d | Initial: ${initialCount} | Critical: ${criticalCount}`}
      >
        {primaryValue > 0 ? (
          primaryMetric === 'avg_duration' ? `${primaryValue.toFixed(1)}d` : primaryValue
        ) : '—'}
      </div>
    );
  }

  return (
    <div className={cn('p-1 text-xs space-y-0.5', intensityClass, className)}>
      <div className="font-bold font-mono">
        {count > 0 ? count : '—'}
      </div>
      <div className="text-muted-foreground space-y-0.5">
        <div>Avg: {avgDuration > 0 ? `${avgDuration.toFixed(1)}d` : '—'}</div>
        <div className="flex justify-between">
          <span>Init: {initialCount}</span>
          <span>Crit: {criticalCount}</span>
        </div>
      </div>
    </div>
  );
};