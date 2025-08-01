
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  GraduationCap, 
  Code, 
  UserCheck,
  Building,
  Calendar,
  Award,
  Target
} from 'lucide-react';
import { UniversityCombobox } from '@/components/admin/university/UniversityCombobox';
import { TrainingProviderCombobox } from '@/components/admin/training/TrainingProviderCombobox';
import SkillTagsInput from '../SkillTagsInput';
import TechnologyTagsInput from '../TechnologyTagsInput';
import GraduationYearRangeControl from '../GraduationYearRangeControl';

interface CollapsibleFilterSectionProps {
  title: string;
  icon: string;
  defaultOpen: boolean;
  type: 'professional' | 'education' | 'projects' | 'status';
  
  // Professional props
  skillInput?: string;
  setSkillInput?: (value: string) => void;
  companyInput?: string;
  setCompanyInput?: (value: string) => void;
  experienceYears?: number[];
  setExperienceYears?: (years: number[]) => void;
  onSkillFilter?: (skill: string) => void;
  onExperienceFilter?: (experience: string) => void;
  
  // Education props
  universityInput?: string;
  setUniversityInput?: (value: string) => void;
  trainingInput?: string;
  setTrainingInput?: (value: string) => void;
  minGraduationYear?: number | null;
  maxGraduationYear?: number | null;
  setMinGraduationYear?: (year: number | null) => void;
  setMaxGraduationYear?: (year: number | null) => void;
  onEducationFilter?: (education: string) => void;
  onTrainingFilter?: (training: string) => void;
  
  // Projects props
  projectNameInput?: string;
  setProjectNameInput?: (value: string) => void;
  projectDescriptionInput?: string;
  setProjectDescriptionInput?: (value: string) => void;
  technologyInput?: string[];
  setTechnologyInput?: (technologies: string[]) => void;
  achievementInput?: string;
  setAchievementInput?: (value: string) => void;
  onProjectFilter?: (project: string) => void;
  onAchievementFilter?: (achievement: string) => void;
  
  // Status props
  completionStatus?: string;
  setCompletionStatus?: (status: string) => void;
  
  // Common props
  onAdvancedFilters?: (filters: any) => void;
  isLoading: boolean;
}

const CollapsibleFilterSection: React.FC<CollapsibleFilterSectionProps> = ({
  title,
  icon,
  defaultOpen,
  type,
  skillInput,
  setSkillInput,
  companyInput,
  setCompanyInput,
  experienceYears,
  setExperienceYears,
  onSkillFilter,
  onExperienceFilter,
  universityInput,
  setUniversityInput,
  trainingInput,
  setTrainingInput,
  minGraduationYear,
  maxGraduationYear,
  setMinGraduationYear,
  setMaxGraduationYear,
  onEducationFilter,
  onTrainingFilter,
  projectNameInput,
  setProjectNameInput,
  projectDescriptionInput,
  setProjectDescriptionInput,
  technologyInput,
  setTechnologyInput,
  achievementInput,
  setAchievementInput,
  onProjectFilter,
  onAchievementFilter,
  completionStatus,
  setCompletionStatus,
  onAdvancedFilters,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getIcon = () => {
    switch (icon) {
      case 'briefcase': return <Briefcase className="h-4 w-4" />;
      case 'graduation-cap': return <GraduationCap className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'user-check': return <UserCheck className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'professional': return 'border-blue-200 bg-blue-50/30 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300';
      case 'education': return 'border-green-200 bg-green-50/30 dark:bg-green-900/10 text-green-700 dark:text-green-300';
      case 'projects': return 'border-purple-200 bg-purple-50/30 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300';
      case 'status': return 'border-orange-200 bg-orange-50/30 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300';
      default: return 'border-gray-200 bg-gray-50/30 dark:bg-gray-900/10 text-gray-700 dark:text-gray-300';
    }
  };

  const applyFilters = () => {
    if (type === 'professional') {
      if (skillInput && onSkillFilter) onSkillFilter(skillInput);
      if (companyInput && onExperienceFilter) onExperienceFilter(companyInput);
      if (experienceYears && onAdvancedFilters) {
        onAdvancedFilters({
          minExperienceYears: experienceYears[0],
          maxExperienceYears: experienceYears[1]
        });
      }
    } else if (type === 'education') {
      if (universityInput && onEducationFilter) onEducationFilter(universityInput);
      if (trainingInput && onTrainingFilter) onTrainingFilter(trainingInput);
      if ((minGraduationYear || maxGraduationYear) && onAdvancedFilters) {
        onAdvancedFilters({
          minGraduationYear,
          maxGraduationYear
        });
      }
    } else if (type === 'projects') {
      if (projectNameInput && onProjectFilter) onProjectFilter(projectNameInput);
      if (projectDescriptionInput && onProjectFilter) onProjectFilter(projectDescriptionInput);
      if (achievementInput && onAchievementFilter) onAchievementFilter(achievementInput);
    } else if (type === 'status') {
      if (completionStatus && onAdvancedFilters) {
        onAdvancedFilters({ completionStatus });
      }
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'professional':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Skills</Label>
              <SkillTagsInput
                value={skillInput ? skillInput.split(',').map(s => s.trim()).filter(Boolean) : []}
                onChange={(skills) => setSkillInput?.(skills.join(', '))}
                placeholder="Add skills..."
                disabled={isLoading}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Company</Label>
              <Input
                placeholder="Company name..."
                value={companyInput || ''}
                onChange={(e) => setCompanyInput?.(e.target.value)}
                className="text-sm"
              />
            </div>
            {experienceYears && setExperienceYears && (
              <div>
                <Label className="text-xs font-medium">
                  Experience: {experienceYears[0]}-{experienceYears[1]} years
                </Label>
                <Slider
                  value={experienceYears}
                  onValueChange={setExperienceYears}
                  max={20}
                  min={0}
                  step={1}
                  className="w-full mt-2"
                />
              </div>
            )}
            <Button onClick={applyFilters} disabled={isLoading} className="w-full text-sm">
              Apply Professional Filters
            </Button>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">University</Label>
              <UniversityCombobox
                value={universityInput || ''}
                onValueChange={setUniversityInput || (() => {})}
                placeholder="Search university..."
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Training Provider</Label>
              <TrainingProviderCombobox
                value={trainingInput || ''}
                onValueChange={setTrainingInput || (() => {})}
                placeholder="Search training..."
                disabled={isLoading}
              />
            </div>
            {setMinGraduationYear && setMaxGraduationYear && (
              <div>
                <Label className="text-xs font-medium">Graduation Years</Label>
                <GraduationYearRangeControl
                  minYear={minGraduationYear}
                  maxYear={maxGraduationYear}
                  onMinYearChange={setMinGraduationYear}
                  onMaxYearChange={setMaxGraduationYear}
                />
              </div>
            )}
            <Button onClick={applyFilters} disabled={isLoading} className="w-full text-sm">
              Apply Education Filters
            </Button>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Project Name</Label>
              <Input
                placeholder="Project name..."
                value={projectNameInput || ''}
                onChange={(e) => setProjectNameInput?.(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Project Description</Label>
              <Input
                placeholder="Project description..."
                value={projectDescriptionInput || ''}
                onChange={(e) => setProjectDescriptionInput?.(e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Technologies</Label>
              <TechnologyTagsInput
                value={technologyInput || []}
                onChange={setTechnologyInput || (() => {})}
                placeholder="Add technologies..."
                disabled={isLoading}
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Achievements</Label>
              <Input
                placeholder="Achievement..."
                value={achievementInput || ''}
                onChange={(e) => setAchievementInput?.(e.target.value)}
                className="text-sm"
              />
            </div>
            <Button onClick={applyFilters} disabled={isLoading} className="w-full text-sm">
              Apply Project Filters
            </Button>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Profile Completion</Label>
              <Select value={completionStatus} onValueChange={setCompletionStatus}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  <SelectItem value="complete">Complete Profiles</SelectItem>
                  <SelectItem value="incomplete">Incomplete Profiles</SelectItem>
                  <SelectItem value="no-skills">Missing Skills</SelectItem>
                  <SelectItem value="no-experience">Missing Experience</SelectItem>
                  <SelectItem value="no-education">Missing Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={applyFilters} disabled={isLoading} className="w-full text-sm">
              Apply Status Filters
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={getColorClasses()}>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            {title}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent>
          {renderContent()}
        </CardContent>
      )}
    </Card>
  );
};

export default CollapsibleFilterSection;
