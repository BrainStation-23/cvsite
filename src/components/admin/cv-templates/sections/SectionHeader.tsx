
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight,
  Trash2,
  GripVertical
} from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';
import { SECTION_TYPES } from './SectionConstants';

interface SectionHeaderProps {
  section: {
    id: string;
    section_type: CVSectionType;
    styling_config: {
      layout_placement?: 'main' | 'sidebar';
    };
  };
  isExpanded: boolean;
  isPageBreak: boolean;
  layoutType: string;
  getSectionLabel: (type: CVSectionType) => string;
  onToggleExpanded: (id: string) => void;
  onRemoveSection: (id: string) => void;
  dragAttributes: any;
  dragListeners: any;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  section,
  isExpanded,
  isPageBreak,
  layoutType,
  getSectionLabel,
  onToggleExpanded,
  onRemoveSection,
  dragAttributes,
  dragListeners
}) => {
  const sectionTypeConfig = SECTION_TYPES.find(type => type.value === section.section_type);
  const Icon = sectionTypeConfig?.icon;
  const isMultiColumnLayout = ['two-column', 'sidebar-left', 'sidebar-right'].includes(layoutType);

  const getSectionColor = (sectionType: CVSectionType): string => {
    switch (sectionType) {
      case 'general':
        return 'border-l-blue-500 bg-blue-50';
      case 'experience':
        return 'border-l-green-500 bg-green-50';
      case 'education':
        return 'border-l-purple-500 bg-purple-50';
      case 'technical_skills':
        return 'border-l-orange-500 bg-orange-50';
      case 'specialized_skills':
        return 'border-l-pink-500 bg-pink-50';
      case 'projects':
        return 'border-l-teal-500 bg-teal-50';
      case 'training':
        return 'border-l-indigo-500 bg-indigo-50';
      case 'achievements':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'page_break':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getIconColor = (sectionType: CVSectionType): string => {
    switch (sectionType) {
      case 'general':
        return 'text-blue-600';
      case 'experience':
        return 'text-green-600';
      case 'education':
        return 'text-purple-600';
      case 'technical_skills':
        return 'text-orange-600';
      case 'specialized_skills':
        return 'text-pink-600';
      case 'projects':
        return 'text-teal-600';
      case 'training':
        return 'text-indigo-600';
      case 'achievements':
        return 'text-yellow-600';
      case 'page_break':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <div 
          {...dragAttributes} 
          {...dragListeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        
        {Icon && (
          <div className={`p-2 rounded-md ${getSectionColor(section.section_type).replace('border-l-', 'bg-').replace('-500', '-100')}`}>
            <Icon className={`h-4 w-4 ${getIconColor(section.section_type)}`} />
          </div>
        )}
        
        <div>
          <h4 className="font-medium text-sm">{getSectionLabel(section.section_type)}</h4>
          <p className="text-xs text-gray-500">{sectionTypeConfig?.description}</p>
          {isMultiColumnLayout && !isPageBreak && (
            <p className="text-xs text-blue-600 font-medium">
              {section.styling_config.layout_placement === 'sidebar' 
                ? (layoutType.includes('sidebar') ? 'Sidebar' : 'Second Column')
                : 'Main Column'
              }
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!isPageBreak && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onToggleExpanded(section.id)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemoveSection(section.id)}
          className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default SectionHeader;
