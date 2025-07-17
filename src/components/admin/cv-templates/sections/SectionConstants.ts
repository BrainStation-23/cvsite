
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Star, 
  FolderOpen, 
  Award, 
  BookOpen,
  FileText,
  Users
} from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';

export const SECTION_TYPES = [
  { 
    value: 'general' as CVSectionType, 
    label: 'General Information', 
    icon: User,
    description: 'Basic personal information and biography'
  },
  { 
    value: 'experience' as CVSectionType, 
    label: 'Work Experience', 
    icon: Briefcase,
    description: 'Professional work history and roles'
  },
  { 
    value: 'education' as CVSectionType, 
    label: 'Education', 
    icon: GraduationCap,
    description: 'Academic qualifications and degrees'
  },
  { 
    value: 'technical_skills' as CVSectionType, 
    label: 'Technical Skills', 
    icon: Code,
    description: 'Programming languages and technical expertise'
  },
  { 
    value: 'specialized_skills' as CVSectionType, 
    label: 'Specialized Skills', 
    icon: Star,
    description: 'Domain-specific skills and competencies'
  },
  { 
    value: 'projects' as CVSectionType, 
    label: 'Projects', 
    icon: FolderOpen,
    description: 'Notable projects and contributions'
  },
  { 
    value: 'training' as CVSectionType, 
    label: 'Training & Certifications', 
    icon: BookOpen,
    description: 'Professional training and certifications'
  },
  { 
    value: 'achievements' as CVSectionType, 
    label: 'Achievements', 
    icon: Award,
    description: 'Notable accomplishments and recognitions'
  },
  { 
    value: 'references' as CVSectionType, 
    label: 'References', 
    icon: Users,
    description: 'Professional references and contacts'
  },
  { 
    value: 'page_break' as CVSectionType, 
    label: 'Page Break', 
    icon: FileText,
    description: 'Insert a page break in the document'
  }
];

export const DISPLAY_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'timeline', label: 'Timeline' },
];
