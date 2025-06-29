
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfessionalFiltersSection from './sections/ProfessionalFiltersSection';
import EducationFiltersSection from './sections/EducationFiltersSection';
import ProjectsFiltersSection from './sections/ProjectsFiltersSection';
import ProfileStatusSection from './sections/ProfileStatusSection';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  skillInput: string;
  setSkillInput: (value: string) => void;
  universityInput: string;
  setUniversityInput: (value: string) => void;
  companyInput: string;
  setCompanyInput: (value: string) => void;
  technologyInput: string[];
  setTechnologyInput: (value: string[]) => void;
  projectNameInput: string;
  setProjectNameInput: (value: string) => void;
  projectDescriptionInput: string;
  setProjectDescriptionInput: (value: string) => void;
  trainingInput: string;
  setTrainingInput: (value: string) => void;
  achievementInput: string;
  setAchievementInput: (value: string) => void;
  experienceYears: number[];
  setExperienceYears: (value: number[]) => void;
  completionStatus: string;
  setCompletionStatus: (value: string) => void;
  minGraduationYear: number | null;
  maxGraduationYear: number | null;
  setMinGraduationYear: (year: number | null) => void;
  setMaxGraduationYear: (year: number | null) => void;
  onSkillFilter: (skill: string) => void;
  onCompanyFilter: (company: string) => void;
  onProjectNameFilter: (name: string) => void;
  onProjectDescriptionFilter: (description: string) => void;
  onTechnologyFilter: (technologies: string[]) => void;
  onTrainingFilter: (training: string) => void;
  onAchievementFilter: (achievement: string) => void;
  onAdvancedFilters: (filters: any) => void;
  onEducationFilter: (education: string) => void;
  onClearAllFilters: () => void;
  isLoading: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  skillInput,
  setSkillInput,
  universityInput,
  setUniversityInput,
  companyInput,
  setCompanyInput,
  technologyInput,
  setTechnologyInput,
  projectNameInput,
  setProjectNameInput,
  projectDescriptionInput,
  setProjectDescriptionInput,
  trainingInput,
  setTrainingInput,
  achievementInput,
  setAchievementInput,
  experienceYears,
  setExperienceYears,
  completionStatus,
  setCompletionStatus,
  minGraduationYear,
  maxGraduationYear,
  setMinGraduationYear,
  setMaxGraduationYear,
  onSkillFilter,
  onCompanyFilter,
  onProjectNameFilter,
  onProjectDescriptionFilter,
  onTechnologyFilter,
  onTrainingFilter,
  onAchievementFilter,
  onAdvancedFilters,
  onEducationFilter,
  onClearAllFilters,
  isLoading
}) => {
  const handleSkillChange = (skills: string[]) => {
    const skillString = skills.join(', ');
    setSkillInput(skillString);
    onSkillFilter(skillString);
  };

  const handleUniversityChange = (value: string) => {
    setUniversityInput(value);
    onEducationFilter(value);
  };

  const handleCompanyChange = (value: string) => {
    setCompanyInput(value);
    onCompanyFilter(value);
  };

  const handleProjectNameChange = (value: string) => {
    setProjectNameInput(value);
    onProjectNameFilter(value);
  };

  const handleProjectDescriptionChange = (value: string) => {
    setProjectDescriptionInput(value);
    onProjectDescriptionFilter(value);
  };

  const handleTechnologyChange = (technologies: string[]) => {
    setTechnologyInput(technologies);
    onTechnologyFilter(technologies);
  };

  const handleTrainingChange = (value: string) => {
    setTrainingInput(value);
    onTrainingFilter(value);
  };

  const handleAchievementChange = (value: string) => {
    setAchievementInput(value);
    onAchievementFilter(value);
  };

  const handleExperienceYearsChange = (years: number[]) => {
    setExperienceYears(years);
    onAdvancedFilters({
      experienceYears: years,
      minGraduationYear,
      maxGraduationYear,
      completionStatus
    });
  };

  const handleGraduationYearChange = (minYear: number | null, maxYear: number | null) => {
    setMinGraduationYear(minYear);
    setMaxGraduationYear(maxYear);
    onAdvancedFilters({
      experienceYears,
      minGraduationYear: minYear,
      maxGraduationYear: maxYear,
      completionStatus
    });
  };

  const handleCompletionStatusChange = (status: string) => {
    setCompletionStatus(status);
    onAdvancedFilters({
      experienceYears,
      minGraduationYear,
      maxGraduationYear,
      completionStatus: status
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-96 bg-white dark:bg-gray-800 border-r shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:sticky lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Advanced Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6">
            <Tabs defaultValue="professional" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="professional" className="text-sm">Professional</TabsTrigger>
                <TabsTrigger value="projects" className="text-sm">Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="professional" className="space-y-6 mt-0">
                <ProfessionalFiltersSection
                  skillInput={skillInput}
                  companyInput={companyInput}
                  experienceYears={experienceYears}
                  onSkillFilter={handleSkillChange}
                  onCompanyFilter={handleCompanyChange}
                  onExperienceYearsChange={handleExperienceYearsChange}
                  isLoading={isLoading}
                />
                
                <EducationFiltersSection
                  universityInput={universityInput}
                  trainingInput={trainingInput}
                  minGraduationYear={minGraduationYear}
                  maxGraduationYear={maxGraduationYear}
                  onUniversityChange={handleUniversityChange}
                  onTrainingChange={handleTrainingChange}
                  onGraduationYearChange={handleGraduationYearChange}
                  isLoading={isLoading}
                />

                <ProfileStatusSection
                  completionStatus={completionStatus}
                  onCompletionStatusChange={handleCompletionStatusChange}
                />
              </TabsContent>
              
              <TabsContent value="projects" className="space-y-6 mt-0">
                <ProjectsFiltersSection
                  projectNameInput={projectNameInput}
                  projectDescriptionInput={projectDescriptionInput}
                  technologyInput={technologyInput}
                  achievementInput={achievementInput}
                  onProjectNameChange={handleProjectNameChange}
                  onProjectDescriptionChange={handleProjectDescriptionChange}
                  onTechnologyChange={handleTechnologyChange}
                  onAchievementChange={handleAchievementChange}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>

            {/* Clear All Button */}
            <div className="pt-6 border-t mt-8">
              <Button 
                variant="outline" 
                onClick={onClearAllFilters}
                disabled={isLoading}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default FilterSidebar;
