
import React from 'react';
import { format } from 'date-fns';

interface QuarterHeaderProps {
  quarterStart: Date;
  quarterEnd: Date;
  months: Date[];
}

export const QuarterHeader: React.FC<QuarterHeaderProps> = ({ quarterStart, quarterEnd, months }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          Q{Math.ceil((quarterStart.getMonth() + 1) / 3)} {quarterStart.getFullYear()} - Resource Timeline
        </h2>
        <p className="text-muted-foreground">
          {format(quarterStart, 'MMM d')} - {format(quarterEnd, 'MMM d, yyyy')}
        </p>
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-4 gap-0 border-b border-border mb-4 pb-2">
        <div className="col-span-1 font-semibold text-sm">Employee</div>
        {months.map((month) => (
          <div key={month.toISOString()} className="text-center font-semibold text-sm">
            {format(month, 'MMM yyyy')}
          </div>
        ))}
      </div>
    </div>
  );
};
