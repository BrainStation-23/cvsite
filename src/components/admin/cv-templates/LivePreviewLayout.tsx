
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Card } from '@/components/ui/card';
import CVPreview from './CVPreview';
import TemplateInspector from './TemplateInspector';
import { CVTemplate } from '@/types/cv-templates';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';

interface LivePreviewLayoutProps {
  template: CVTemplate;
  selectedProfile: any;
  onTemplateUpdate: (updates: Partial<CVTemplate>) => void;
  onSectionsChange: () => void;
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
  profiles: EmployeeProfile[];
}

const LivePreviewLayout: React.FC<LivePreviewLayoutProps> = ({
  template,
  selectedProfile,
  onTemplateUpdate,
  onSectionsChange,
  selectedProfileId,
  onProfileChange,
  profiles
}) => {
  const [previewKey, setPreviewKey] = useState(0);

  const handleConfigurationChange = () => {
    // Force preview to re-render when configuration changes
    setPreviewKey(prev => prev + 1);
    onSectionsChange?.();
  };

  const handleProfileChange = (profileId: string) => {
    console.log('Profile changed to:', profileId);
    onProfileChange(profileId);
    // Force preview to re-render when profile changes
    setPreviewKey(prev => prev + 1);
  };

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Live Preview Panel */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="h-full p-6 overflow-auto bg-gray-50">
            {selectedProfile ? (
              <div className="flex justify-center">
                <CVPreview 
                  key={previewKey}
                  template={template} 
                  profile={selectedProfile} 
                />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">No Profile Selected</p>
                  <p className="text-sm mt-2">Choose an employee profile from the inspector to preview the CV template</p>
                </div>
              </Card>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Inspector Panel */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
          <div className="h-full border-l border-gray-200">
            <TemplateInspector
              template={template}
              onTemplateUpdate={onTemplateUpdate}
              onConfigurationChange={handleConfigurationChange}
              selectedProfileId={selectedProfileId}
              onProfileChange={handleProfileChange}
              profiles={profiles}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default LivePreviewLayout;
