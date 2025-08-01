
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CompactSkillsSummaryProps {
  skills: Array<{
    name: string;
    proficiency: number;
  }>;
}

export const CompactSkillsSummary: React.FC<CompactSkillsSummaryProps> = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {skills.slice(0, 3).map((skill, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {skill.name}
        </Badge>
      ))}
      {skills.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{skills.length - 3}
        </Badge>
      )}
    </div>
  );
};
