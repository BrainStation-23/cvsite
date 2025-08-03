import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SelectContent, SelectItem } from '@/components/ui/select';
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
  Target,
  TrendingUp,
  BookOpen,
  Wrench
} from 'lucide-react';
import { UniversityCombobox } from '@/components/admin/university/UniversityCombobox';
import { TrainingProviderCombobox } from '@/components/admin/training/TrainingProviderCombobox';
import SkillTagsInput from '../SkillTagsInput';
import TechnologyTagsInput from '../TechnologyTagsInput';
import GraduationYearRangeControl from '../GraduationYearRangeControl';
import FloatingLabelInput from './FloatingLabelInput';
import ThemedSelect from './ThemedSelect';
import ThemedSlider from './ThemedSlider';
import ThemedTagsInput from './ThemedTagsInput';
import ThemedCombobox from './ThemedCombobox';

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
      case 'professional': return 'border-blue-200 bg-blue-50/20 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300';
      case 'education': return 'border-green-200 bg-green-50/20 dark:bg-green-900/10 text-green-700 dark:text-green-300';
      case 'projects': return 'border-purple-200 bg-purple-50/20 dark:bg-purple-900/10 text-purple-700 dark:text-purple-300';
      case 'status': return 'border-orange-200 bg-orange-50/20 dark:bg-orange-900/10 text-orange-700 dark:text-orange-300';
      default: return 'border-gray-200 bg-gray-50/20 dark:bg-gray-900/10 text-gray-700 dark:text-gray-300';
    }
  };

  const getTheme = () => {
    switch (type) {
      case 'professional': return 'blue';
      case 'education': return 'green';
      case 'projects': return 'purple';
      case 'status': return 'orange';
      default: return 'gray';
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
    const theme = getTheme();

    switch (type) {
      case 'professional':
        return (
          <div className="space-y-4">
            <ThemedTagsInput
              label="Search skills"
              theme={theme}
              icon={<Wrench className="h-4 w-4" />}
              value={skillInput ? skillInput.split(',').map(s => s.trim()).filter(Boolean) : []}
              onChange={(skills) => setSkillInput?.(skills.join(', '))}
              placeholder="e.g., React, Python, AWS..."
              disabled={isLoading}
              component={SkillTagsInput}
            />
            
            <FloatingLabelInput
              label="Company experience"
              theme={theme}
              icon={<Building className="h-4 w-4" />}
              value={companyInput || ''}
              onChange={(e) => setCompanyInput?.(e.target.value)}
              placeholder="e.g., Google, Microsoft, Accenture..."
              showClear={!!companyInput}
              onClear={() => setCompanyInput?.('')}
            />
            
            {experienceYears && setExperienceYears && (
              <ThemedSlider
                label="Years of experience"
                theme={theme}
                icon={<TrendingUp className="h-4 w-4" />}
                value={experienceYears}
                onValueChange={setExperienceYears}
                max={20}
                min={0}
                step={1}
              />
            )}
            
            <Button onClick={applyFilters} disabled={isLoading} className="w-full">
              Apply Professional Filters
            </Button>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <ThemedCombobox
              label="University or institution"
              theme={theme}
              icon={<GraduationCap className="h-4 w-4" />}
              value={universityInput || ''}
              onValueChange={setUniversityInput || (() => {})}
              placeholder="Search universities..."
              component={UniversityCombobox}
            />
            
            <ThemedCombobox
              label="Training provider"
              theme={theme}
              icon={<BookOpen className="h-4 w-4" />}
              value={trainingInput || ''}
              onValueChange={setTrainingInput || (() => {})}
              placeholder="Search training providers..."
              component={TrainingProviderCombobox}
              disabled={isLoading}
            />
            
            {setMinGraduationYear && setMaxGraduationYear && (
              <div className={`border rounded-md px-3 py-3 transition-all duration-200 bg-${theme}-50/30 border-${theme}-200`}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className={`h-4 w-4 text-${theme}-500`} />
                  <label className={`text-xs font-medium text-${theme}-600`}>
                    Graduation period
                  </label>
                </div>
                <GraduationYearRangeControl
                  minYear={minGraduationYear}
                  maxYear={maxGraduationYear}
                  onMinYearChange={setMinGraduationYear}
                  onMaxYearChange={setMaxGraduationYear}
                />
              </div>
            )}
            
            <Button onClick={applyFilters} disabled={isLoading} className="w-full">
              Apply Education Filters
            </Button>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-4">
            <FloatingLabelInput
              label="Project name"
              theme={theme}
              icon={<Target className="h-4 w-4" />}
              value={projectNameInput || ''}
              onChange={(e) => setProjectNameInput?.(e.target.value)}
              placeholder="e.g., E-commerce Platform, Mobile App..."
              showClear={!!projectNameInput}
              onClear={() => setProjectNameInput?.('')}
            />
            
            <FloatingLabelInput
              label="Project description"
              theme={theme}
              icon={<Code className="h-4 w-4" />}
              value={projectDescriptionInput || ''}
              onChange={(e) => setProjectDescriptionInput?.(e.target.value)}
              placeholder="Key words from project details..."
              showClear={!!projectDescriptionInput}
              onClear={() => setProjectDescriptionInput?.('')}
            />
            
            <ThemedTagsInput
              label="Technologies used"
              theme={theme}
              icon={<Wrench className="h-4 w-4" />}
              value={technologyInput || []}
              onChange={setTechnologyInput || (() => {})}
              placeholder="e.g., React, Node.js, MongoDB..."
              disabled={isLoading}
              component={TechnologyTagsInput}
            />
            
            <FloatingLabelInput
              label="Achievements & awards"
              theme={theme}
              icon={<Award className="h-4 w-4" />}
              value={achievementInput || ''}
              onChange={(e) => setAchievementInput?.(e.target.value)}
              placeholder="e.g., Best Innovation Award, Patent..."
              showClear={!!achievementInput}
              onClear={() => setAchievementInput?.('')}
            />
            
            <Button onClick={applyFilters} disabled={isLoading} className="w-full">
              Apply Project Filters
            </Button>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-4">
            <ThemedSelect
              label="Profile completion status"
              theme={theme}
              icon={<UserCheck className="h-4 w-4" />}
              value={completionStatus}
              onValueChange={setCompletionStatus}
              placeholder="Select completion level..."
            >
              <SelectItem value="all">All Profiles</SelectItem>
              <SelectItem value="complete">Complete Profiles</SelectItem>
              <SelectItem value="incomplete">Incomplete Profiles</SelectItem>
              <SelectItem value="no-skills">Missing Skills</SelectItem>
              <SelectItem value="no-experience">Missing Experience</SelectItem>
              <SelectItem value="no-education">Missing Education</SelectItem>
            </ThemedSelect>
            
            <Button onClick={applyFilters} disabled={isLoading} className="w-full">
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
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            {title}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {renderContent()}
        </CardContent>
      )}
    </Card>
  );
};

export default CollapsibleFilterSection;
