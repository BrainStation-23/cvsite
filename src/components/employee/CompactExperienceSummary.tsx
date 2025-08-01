
import React from 'react';

interface CompactExperienceSummaryProps {
  experiences: Array<{
    company_name: string;
    designation: string;
    is_current: boolean;
  }>;
}

export const CompactExperienceSummary: React.FC<CompactExperienceSummaryProps> = ({ experiences }) => {
  if (!experiences || experiences.length === 0) return null;

  const currentExp = experiences.find(exp => exp.is_current);
  const displayExp = currentExp || experiences[0];

  return (
    <div className="text-xs text-gray-600">
      <div className="font-medium">{displayExp.designation}</div>
      <div className="text-gray-500">{displayExp.company_name}</div>
    </div>
  );
};
