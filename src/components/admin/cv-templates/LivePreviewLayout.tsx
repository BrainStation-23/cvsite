
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Card } from '@/components/ui/card';
import CVPreview from './CVPreview';
import TemplateInspector from './TemplateInspector';
import { CVTemplate } from '@/types/cv-templates';

interface LivePreviewLayoutProps {
  template: CVTemplate;
  selectedProfile: any;
  onTemplateUpdate: (updates: Partial<CVTemplate>) => void;
  onSectionsChange: () => void;
}

const LivePreviewLayout: React.FC<LivePreviewLayoutProps> = ({
  template,
  selectedProfile,
  onTemplateUpdate,
  onSectionsChange
}) => {
  const [previewKey, setPreviewKey] = useState(0);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [currentSelectedProfile, setCurrentSelectedProfile] = useState<any>(selectedProfile);

  const handleConfigurationChange = () => {
    // Force preview to re-render when configuration changes
    setPreviewKey(prev => prev + 1);
    onSectionsChange?.();
  };

  const handleProfileChange = (profileId: string) => {
    console.log('Profile changed to:', profileId);
    setSelectedProfileId(profileId);
    // The profile data will be passed from the parent component
    // For now, we'll trigger a re-render
    setPreviewKey(prev => prev + 1);
  };

  // Use the selectedProfile from props if available, otherwise use the local state
  const profileToDisplay = selectedProfile || currentSelectedProfile;

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Live Preview Panel */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="h-full p-6 overflow-auto bg-gray-50">
            {profileToDisplay ? (
              <div className="flex justify-center">
                <CVPreview 
                  key={previewKey}
                  template={template} 
                  profile={profileToDisplay} 
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
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default LivePreviewLayout;
