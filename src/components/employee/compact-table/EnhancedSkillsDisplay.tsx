
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
import { Code, Star, ChevronDown } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  proficiency: number;
}

interface EnhancedSkillsDisplayProps {
  technicalSkills?: Skill[] | null;
  specializedSkills?: Skill[] | null;
}

const EnhancedSkillsDisplay: React.FC<EnhancedSkillsDisplayProps> = ({
  technicalSkills,
  specializedSkills
}) => {
  const safeTechnicalSkills = technicalSkills || [];
  const safeSpecializedSkills = specializedSkills || [];
  const totalSkills = safeTechnicalSkills.length + safeSpecializedSkills.length;

  if (totalSkills === 0) {
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

  const getProficiencyLevel = (proficiency: number) => {
    if (proficiency >= 8) return 'Expert';
    if (proficiency >= 6) return 'Advanced';
    if (proficiency >= 4) return 'Intermediate';
    return 'Beginner';
  };

  const renderSkillBadge = (skill: Skill, type: 'technical' | 'specialized') => (
    <Tooltip key={skill.id}>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`text-xs px-2 py-1 cursor-help ${getProficiencyColor(skill.proficiency)}`}
        >
          <div className="flex items-center gap-1">
            {type === 'technical' ? (
              <Code className="h-2.5 w-2.5" />
            ) : (
              <Star className="h-2.5 w-2.5" />
            )}
            <span className="truncate max-w-16">{skill.name}</span>
            <div className="w-2 h-2 rounded-full bg-current opacity-60" />
          </div>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center space-y-1">
          <p className="font-medium">{skill.name}</p>
          <p className="text-xs">{getProficiencyLevel(skill.proficiency)} ({skill.proficiency}/10)</p>
          <p className="text-xs capitalize">{type} Skill</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );

  // Show top 4 skills (2 technical, 2 specialized if available)
  const topTechnical = safeTechnicalSkills.slice(0, 2);
  const topSpecialized = safeSpecializedSkills.slice(0, 2);
  const displayedSkills = [...topTechnical, ...topSpecialized];
  const hasMore = totalSkills > displayedSkills.length;

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            <span>Skills ({totalSkills})</span>
          </div>
          {safeTechnicalSkills.length > 0 && safeSpecializedSkills.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Badge variant="outline" className="text-xs px-1 py-0">
                {safeTechnicalSkills.length}T
              </Badge>
              <Badge variant="outline" className="text-xs px-1 py-0">
                {safeSpecializedSkills.length}S
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {topTechnical.map(skill => renderSkillBadge(skill, 'technical'))}
          {topSpecialized.map(skill => renderSkillBadge(skill, 'specialized'))}
          
          {hasMore && (
            <Popover>
              <PopoverTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-1 cursor-pointer hover:bg-muted flex items-center gap-1"
                >
                  <span>+{totalSkills - displayedSkills.length}</span>
                  <ChevronDown className="h-3 w-3" />
                </Badge>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    All Skills ({totalSkills})
                  </h4>
                  
                  {safeTechnicalSkills.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Code className="h-3 w-3" />
                        Technical Skills ({safeTechnicalSkills.length})
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {safeTechnicalSkills.map(skill => renderSkillBadge(skill, 'technical'))}
                      </div>
                    </div>
                  )}
                  
                  {safeSpecializedSkills.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Specialized Skills ({safeSpecializedSkills.length})
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {safeSpecializedSkills.map(skill => renderSkillBadge(skill, 'specialized'))}
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedSkillsDisplay;
