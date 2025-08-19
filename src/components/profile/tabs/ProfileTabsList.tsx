
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
  FileJson,
  Bot
} from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { GeneralInfoFormData } from '../generalInfo/GeneralInfoTab';
import { Skill, Experience, Education, Training, Achievement, Project } from '@/types';

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
      <TabsList className="grid w-full grid-cols-9 h-12 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
        <TabTriggerWithIcon
          value="general"
          icon={User}
          label="General"
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
          label="Experience"
          isEmpty={experiences.length === 0}
          dataTour="experience-tab"
        />
        <TabTriggerWithIcon
          value="education"
          icon={GraduationCap}
          label="Education"
          isEmpty={education.length === 0}
          dataTour="education-tab"
        />
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
          value="cv-import"
          icon={Bot}
          label="AI Import"
          isEmpty={false}
          dataTour="cv-import-tab"
        />
        <TabTriggerWithIcon
          value="json"
          icon={FileJson}
          label="JSON"
          isEmpty={false}
          dataTour="json-tab"
        />
      </TabsList>
    </div>
  );
};
