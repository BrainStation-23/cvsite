
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Download, RotateCcw } from 'lucide-react';
import { EmployeeCombobox } from './EmployeeCombobox';
import { EmployeeProfile } from '@/hooks/types/employee-profiles';

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
  profiles: EmployeeProfile[];
  onExport?: () => void;
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
  profiles,
  onExport
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(templateName);

  const handleNameSave = () => {
    onTemplateNameChange(editedName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setEditedName(templateName);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

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
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-cvsite-navy dark:text-white">
              Template Editor
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {isEditingName ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={handleNameKeyDown}
                  className="h-7 text-sm font-medium"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                >
                  {templateName}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Employee Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Preview:</span>
            <div className="w-48">
              <EmployeeCombobox
                profiles={profiles}
                value={selectedProfileId}
                onValueChange={onProfileChange}
                placeholder="Select employee..."
                isLoading={false}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <Button 
            size="sm"
            variant="outline"
            onClick={onExport} 
            disabled={!selectedProfileId}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {hasUnsavedChanges && (
            <Button 
              size="sm"
              variant="outline"
              onClick={onDiscard}
              disabled={isSaving}
              className="text-gray-600 hover:text-gray-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Discard
            </Button>
          )}
          
          <Button 
            onClick={onSave} 
            disabled={isSaving || !hasUnsavedChanges}
            className={`transition-colors duration-200 ${
              hasUnsavedChanges 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : ''
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
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
