
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Card } from '@/components/ui/card';
import CVPreview from './CVPreview';
import { useTemplateReferences } from '@/hooks/use-template-references';

// Helper component to fetch references and merge into profile
const MergedProfilePreview: React.FC<{ template: any; profile: any }> = ({ template, profile }) => {
  const { references, isLoading } = useTemplateReferences();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mr-3"></div>
        <span className="text-gray-500 text-sm">Loading references...</span>
      </div>
    );
  }

  const mergedProfile = { ...profile, references };
  return <CVPreview template={template} profile={mergedProfile} />;
};
import TemplateInspector from './TemplateInspector';
import { CVTemplate } from '@/types/cv-templates';

interface LivePreviewLayoutProps {
  template: CVTemplate;
  selectedProfile: any;
  onTemplateUpdate: (updates: Partial<CVTemplate>) => void;
  onSectionsChange: () => void;
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
}

const LivePreviewLayout: React.FC<LivePreviewLayoutProps> = ({
  template,
  selectedProfile,
  onTemplateUpdate,
  onSectionsChange
}) => {
  const [previewKey, setPreviewKey] = useState(0);

  const handleConfigurationChange = () => {
    // Force preview to re-render when configuration changes
    setPreviewKey(prev => prev + 1);
    onSectionsChange?.();
  };

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Live Preview Panel */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="h-full p-6 overflow-auto bg-gray-50">
            {/* Fetch references and merge into profile for CVPreview */}
            {selectedProfile ? (
              <MergedProfilePreview
                key={previewKey}
                template={template}
                profile={selectedProfile}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">No Profile Selected</p>
                  <p className="text-sm mt-2">Choose an employee profile from the header to preview the CV template</p>
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
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default LivePreviewLayout;
