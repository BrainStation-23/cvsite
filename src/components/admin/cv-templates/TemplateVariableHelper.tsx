
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateStructureGuide } from './TemplateStructureGuide';

interface TemplateVariableHelperProps {
  selectedEmployeeId: string | null;
  onInsertExample?: (html: string) => void;
}

export const TemplateVariableHelper: React.FC<TemplateVariableHelperProps> = ({
  selectedEmployeeId,
  onInsertExample
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-medium text-sm">Template Helper</h3>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="structure" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-3 mt-3">
            <TabsTrigger value="structure">Structure Guide</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="flex-1 m-0">
            <TemplateStructureGuide onInsertExample={onInsertExample} />
          </TabsContent>

          <TabsContent value="variables" className="flex-1 m-3">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Employee Variables</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <code>{"{{employee.firstName}}"}</code>
                    <p className="text-xs text-gray-600">Employee first name</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <code>{"{{employee.lastName}}"}</code>
                    <p className="text-xs text-gray-600">Employee last name</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <code>{"{{employee.email}}"}</code>
                    <p className="text-xs text-gray-600">Employee email</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <code>{"{{employee.currentDesignation}}"}</code>
                    <p className="text-xs text-gray-600">Current job title</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <code>{"{{employee.biography}}"}</code>
                    <p className="text-xs text-gray-600">Professional summary</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Loop Variables</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-blue-50 rounded">
                    <code>{"{{#each employee.experiences}}"}</code>
                    <p className="text-xs text-gray-600">Loop through work experience</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <code>{"{{#each employee.education}}"}</code>
                    <p className="text-xs text-gray-600">Loop through education</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <code>{"{{#each employee.technicalSkills}}"}</code>
                    <p className="text-xs text-gray-600">Loop through technical skills</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Context Variables (inside loops)</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-green-50 rounded">
                    <code>{"{{this.designation}}"}</code>
                    <p className="text-xs text-gray-600">Job title (in experience loop)</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <code>{"{{this.companyName}}"}</code>
                    <p className="text-xs text-gray-600">Company name (in experience loop)</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <code>{"{{this.dateRange}}"}</code>
                    <p className="text-xs text-gray-600">Formatted date range</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
