
import React from 'react';

interface CompactEducationSummaryProps {
  education: Array<{
    degree: string;
    university: string;
    is_current: boolean;
  }>;
}

export const CompactEducationSummary: React.FC<CompactEducationSummaryProps> = ({ education }) => {
  if (!education || education.length === 0) return null;

  const currentEd = education.find(ed => ed.is_current);
  const displayEd = currentEd || education[0];

  return (
    <div className="text-xs text-gray-600">
      <div className="font-medium">{displayEd.degree}</div>
      <div className="text-gray-500">{displayEd.university}</div>
    </div>
  );
};
