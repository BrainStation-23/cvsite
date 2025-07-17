
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Star } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  proficiency: number;
}

interface CompactSkillsSummaryProps {
  skills?: Skill[] | null;
}

const CompactSkillsSummary: React.FC<CompactSkillsSummaryProps> = ({
  skills
}) => {
  // Handle null/undefined skills by converting to empty array
  const safeSkills = skills || [];

  if (safeSkills.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No skills listed
      </div>
    );
  }

  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (proficiency >= 6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (proficiency >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getProficiencyStars = (proficiency: number) => {
    const stars = Math.min(5, Math.max(1, Math.ceil(proficiency / 2)));
    return Array.from({ length: stars }, (_, i) => (
      <Star key={i} className="h-2 w-2 fill-current" />
    ));
  };

  const displaySkills = safeSkills.slice(0, 3);
  const hasMore = safeSkills.length > 3;

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {displaySkills.map((skill) => (
          <Tooltip key={skill.id}>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-0.5 cursor-help ${getProficiencyColor(skill.proficiency)}`}
              >
                <span className="truncate max-w-16">{skill.name}</span>
                <div className="flex ml-1">
                  {getProficiencyStars(skill.proficiency)}
                </div>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-medium">{skill.name}</p>
                <p className="text-xs">Proficiency: {skill.proficiency}/10</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {hasMore && (
          <Popover>
            <PopoverTrigger asChild>
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5 cursor-pointer hover:bg-muted"
              >
                +{safeSkills.length - 3}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">All Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {safeSkills.map((skill) => (
                    <Badge 
                      key={skill.id}
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 ${getProficiencyColor(skill.proficiency)}`}
                    >
                      <span>{skill.name}</span>
                      <div className="flex ml-1">
                        {getProficiencyStars(skill.proficiency)}
                      </div>
                    </Badge>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CompactSkillsSummary;
