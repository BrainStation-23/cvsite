
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { CVSectionType } from '@/types/cv-templates';
import { SECTION_TYPES } from './SectionConstants';

interface AddSectionPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableSectionTypes: { value: CVSectionType; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[];
  onAddSection: (sectionType: CVSectionType) => void;
}

const AddSectionPanel: React.FC<AddSectionPanelProps> = ({
  isOpen,
  onOpenChange,
  availableSectionTypes,
  onAddSection
}) => {
  if (availableSectionTypes.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Section
              </CardTitle>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {availableSectionTypes.map(sectionType => {
                const Icon = sectionType.icon;
                return (
                  <Button
                    key={sectionType.value}
                    variant="outline"
                    onClick={() => onAddSection(sectionType.value)}
                    className="h-auto p-3 text-left justify-start"
                  >
                    <Icon className="h-4 w-4 mr-3 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">{sectionType.label}</div>
                      <div className="text-xs text-gray-500">{sectionType.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default AddSectionPanel;
