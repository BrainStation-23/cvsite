import React from 'react';

export const BenchReport: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bench Report</h2>
          <p className="text-muted-foreground">View and analyze bench utilization and resources</p>
        </div>
      </div>
    </div>
  );
};

export default BenchReport;
