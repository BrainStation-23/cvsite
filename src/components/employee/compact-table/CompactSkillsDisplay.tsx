
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Code, Star } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  proficiency: number;
}

interface CompactSkillsDisplayProps {
  technicalSkills?: Skill[];
  specializedSkills?: Skill[];
}

const CompactSkillsDisplay: React.FC<CompactSkillsDisplayProps> = ({
  technicalSkills = [],
  specializedSkills = []
}) => {
  const [showAllTechnical, setShowAllTechnical] = useState(false);
  const [showAllSpecialized, setShowAllSpecialized] = useState(false);

  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (proficiency >= 6) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (proficiency >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const renderSkillBadge = (skill: Skill) => (
    <Badge 
      key={skill.id}
      variant="outline" 
      className={`text-xs px-2 py-1 ${getProficiencyColor(skill.proficiency)}`}
    >
      <span className="truncate max-w-20">{skill.name}</span>
      <span className="ml-1 font-medium">{skill.proficiency}</span>
    </Badge>
  );

  const renderSkillSection = (
    skills: Skill[],
    title: string,
    icon: React.ReactNode,
    showAll: boolean,
    setShowAll: (show: boolean) => void
  ) => {
    if (skills.length === 0) return null;

    const displaySkills = showAll ? skills : skills.slice(0, 2);
    const hasMore = skills.length > 2;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {displaySkills.map(renderSkillBadge)}
          {hasMore && !showAll && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowAll(true)}
                >
                  +{skills.length - 2} more
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{title}</h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.map(renderSkillBadge)}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    );
  };

  if (technicalSkills.length === 0 && specializedSkills.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No skills listed
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {renderSkillSection(
        technicalSkills,
        'Technical',
        <Code className="h-3 w-3" />,
        showAllTechnical,
        setShowAllTechnical
      )}
      {renderSkillSection(
        specializedSkills,
        'Specialized',
        <Star className="h-3 w-3" />,
        showAllSpecialized,
        setShowAllSpecialized
      )}
    </div>
  );
};

export default CompactSkillsDisplay;
