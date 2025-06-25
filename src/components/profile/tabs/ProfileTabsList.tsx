
import React from 'react';
import { TabsList } from '@/components/ui/tabs';
import { TabTriggerWithIcon } from './TabTriggerWithIcon';
import { 
  User, 
  Code, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Trophy, 
  FolderOpen, 
  FileJson
} from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoFormData } from '../generalInfo/GeneralInfoTab';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileTabsListProps {
  form: UseFormReturn<GeneralInfoFormData>;
  technicalSkills: Skill[];
  specializedSkills: Skill[];
  experiences: Experience[];
  education: Education[];
  trainings: Training[];
  achievements: Achievement[];
  projects: Project[];
}

export const ProfileTabsList: React.FC<ProfileTabsListProps> = ({
  form,
  technicalSkills,
  specializedSkills,
  experiences,
  education,
  trainings,
  achievements,
  projects
}) => {
  const isMobile = useIsMobile();

  // Helper function to check if general info is incomplete
  const isGeneralInfoIncomplete = () => {
    const firstName = form.getValues('firstName');
    const lastName = form.getValues('lastName');
    const biography = form.getValues('biography');
    const profileImage = form.getValues('profileImage');
    
    return !firstName || !lastName || !biography || !profileImage;
  };

  return (
    <div className="flex-shrink-0">
      <TabsList className={`grid w-full ${isMobile ? 'grid-cols-4' : 'grid-cols-8'} h-12 bg-gray-100 dark:bg-gray-800 rounded-md p-1 ${isMobile ? 'overflow-x-auto' : ''}`}>
        <TabTriggerWithIcon
          value="general"
          icon={User}
          label={isMobile ? "Info" : "General"}
          isEmpty={isGeneralInfoIncomplete()}
          dataTour="general-tab"
        />
        <TabTriggerWithIcon
          value="skills"
          icon={Code}
          label="Skills"
          isEmpty={technicalSkills.length === 0 && specializedSkills.length === 0}
          dataTour="skills-tab"
        />
        <TabTriggerWithIcon
          value="experience"
          icon={Briefcase}
          label={isMobile ? "Exp" : "Experience"}
          isEmpty={experiences.length === 0}
          dataTour="experience-tab"
        />
        <TabTriggerWithIcon
          value="education"
          icon={GraduationCap}
          label={isMobile ? "Edu" : "Education"}
          isEmpty={education.length === 0}
          dataTour="education-tab"
        />
        {!isMobile && (
          <>
            <TabTriggerWithIcon
              value="training"
              icon={Award}
              label="Training"
              isEmpty={trainings.length === 0}
              dataTour="training-tab"
            />
            <TabTriggerWithIcon
              value="achievements"
              icon={Trophy}
              label="Achievements"
              isEmpty={achievements.length === 0}
              dataTour="achievements-tab"
            />
            <TabTriggerWithIcon
              value="projects"
              icon={FolderOpen}
              label="Projects"
              isEmpty={projects.length === 0}
              dataTour="projects-tab"
            />
            <TabTriggerWithIcon
              value="json"
              icon={FileJson}
              label="JSON"
              isEmpty={false}
              dataTour="json-tab"
            />
          </>
        )}
      </TabsList>
      
      {isMobile && (
        <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-100 dark:bg-gray-800 rounded-md p-1 mt-2">
          <TabTriggerWithIcon
            value="training"
            icon={Award}
            label="Training"
            isEmpty={trainings.length === 0}
            dataTour="training-tab"
          />
          <TabTriggerWithIcon
            value="achievements"
            icon={Trophy}
            label="Awards"
            isEmpty={achievements.length === 0}
            dataTour="achievements-tab"
          />
          <TabTriggerWithIcon
            value="projects"
            icon={FolderOpen}
            label="Projects"
            isEmpty={projects.length === 0}
            dataTour="projects-tab"
          />
          <TabTriggerWithIcon
            value="json"
            icon={FileJson}
            label="JSON"
            isEmpty={false}
            dataTour="json-tab"
          />
        </TabsList>
      )}
    </div>
  );
};
