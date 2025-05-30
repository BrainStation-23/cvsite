
import { 
  User,
  Code,
  Wrench,
  Briefcase,
  GraduationCap,
  Award,
  Trophy,
  FolderOpen,
  Target
} from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';

export const SECTION_TYPES: { 
  value: CVSectionType; 
  label: string; 
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { value: 'general', label: 'General Information', icon: User, description: 'Name, contact, bio' },
  { value: 'technical_skills', label: 'Technical Skills', icon: Code, description: 'Programming, tools' },
  { value: 'specialized_skills', label: 'Specialized Skills', icon: Wrench, description: 'Domain expertise' },
  { value: 'experience', label: 'Work Experience', icon: Briefcase, description: 'Employment history' },
  { value: 'education', label: 'Education', icon: GraduationCap, description: 'Academic background' },
  { value: 'training', label: 'Training & Certifications', icon: Award, description: 'Courses, certificates' },
  { value: 'achievements', label: 'Achievements', icon: Trophy, description: 'Awards, recognition' },
  { value: 'projects', label: 'Projects', icon: FolderOpen, description: 'Portfolio work' },
];

export const DISPLAY_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'timeline', label: 'Timeline' },
];
