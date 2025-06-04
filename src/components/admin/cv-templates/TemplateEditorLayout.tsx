
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmployeeCombobox } from './EmployeeCombobox';
import ExportButton from './ExportButton';

interface TemplateEditorLayoutProps {
  children: React.ReactNode;
  templateName: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onTemplateNameChange: (name: string) => void;
  selectedProfileId: string;
  onProfileChange: (profileId: string) => void;
  onExport: () => void;
  // New props for export functionality
  templateSections?: any[];
  templateFieldMappings?: any[];
  template?: any;
  selectedProfile?: any;
}

const TemplateEditorLayout: React.FC<TemplateEditorLayoutProps> = ({
  children,
  templateName,
  hasUnsavedChanges,
  isSaving,
  onBack,
  onSave,
  onDiscard,
  onTemplateNameChange,
  selectedProfileId,
  onProfileChange,
  onExport,
  templateSections = [],
  templateFieldMappings = [],
  template,
  selectedProfile
}) => {
  // Create styles object for export (this should match what's used in the preview)
  const styles = {
    baseStyles: {
      baseFontSize: 12,
      headingSize: 16,
      subheadingSize: 14,
      primaryColor: '#1f2937',
      secondaryColor: '#6b7280',
      accentColor: '#3b82f6',
      margin: 20,
      orientation: template?.orientation || 'portrait'
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center space-x-2">
              <Input
                value={templateName}
                onChange={(e) => onTemplateNameChange(e.target.value)}
                className="font-semibold text-lg border-none shadow-none p-0 h-auto focus-visible:ring-0"
                placeholder="Template Name"
              />
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600">• Unsaved changes</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <EmployeeCombobox
              value={selectedProfileId}
              onValueChange={onProfileChange}
              placeholder="Select employee for preview"
            />
            
            <ExportButton
              template={template}
              profile={selectedProfile}
              sections={templateSections}
              fieldMappings={templateFieldMappings}
              styles={styles}
              disabled={!selectedProfile || !template}
            />
            
            {hasUnsavedChanges && (
              <Button variant="outline" size="sm" onClick={onDiscard}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Discard
              </Button>
            )}
            
            <Button size="sm" onClick={onSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default TemplateEditorLayout;
