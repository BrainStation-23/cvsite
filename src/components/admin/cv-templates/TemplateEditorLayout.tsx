
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

interface TemplateEditorLayoutProps {
  children: React.ReactNode;
  templateName: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onBack: () => void;
  onSave: () => void;
}

const TemplateEditorLayout: React.FC<TemplateEditorLayoutProps> = ({
  children,
  templateName,
  hasUnsavedChanges,
  isSaving,
  onBack,
  onSave
}) => {
  return (
    <div className="h-screen w-full bg-white dark:bg-gray-900 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="hover-scale"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-cvsite-navy dark:text-white">
              Template Editor
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{templateName}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            className={`transition-all duration-200 ${
              hasUnsavedChanges 
                ? 'bg-orange-600 hover:bg-orange-700 animate-pulse' 
                : ''
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes *' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-3 animate-slide-in-right">
          <p className="text-sm text-orange-700">You have unsaved changes</p>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};

export default TemplateEditorLayout;
