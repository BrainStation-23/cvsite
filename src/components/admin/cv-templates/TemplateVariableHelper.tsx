
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateStructureGuide } from './TemplateStructureGuide';
import { useEmployeeData } from '@/hooks/use-employee-data';
import { Button } from '@/components/ui/button';
import { Copy, ChevronDown, ChevronRight, Bot, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAIPrompt } from '@/utils/ai-prompt-generator';
import { ENHANCED_BASIC_TEMPLATE } from '@/constants/cv-template-examples/enhanced-basic';

interface TemplateVariableHelperProps {
  selectedEmployeeId: string | null;
  onInsertExample?: (html: string) => void;
}

interface VariableGroup {
  title: string;
  variables: Array<{
    name: string;
    description: string;
    example?: string;
    type: 'string' | 'array' | 'object';
  }>;
}

export const TemplateVariableHelper: React.FC<TemplateVariableHelperProps> = ({
  selectedEmployeeId,
  onInsertExample
}) => {
  const { data: employeeData } = useEmployeeData(selectedEmployeeId || '');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([
    'General Information',
    'Technical Skills',
    'Specialized Skills',
    'Work Experience',
    'Education',
    'Projects',
    'Achievements',
    'Training & Certifications'
  ]));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const copyAIPrompt = () => {
    const prompt = generateAIPrompt();
    navigator.clipboard.writeText(prompt);
    toast.success('AI prompt copied to clipboard! Paste it into your AI assistant along with a design reference image.');
  };

  const insertEnhancedTemplate = () => {
    if (onInsertExample) {
      onInsertExample(ENHANCED_BASIC_TEMPLATE);
      toast.success('Enhanced template inserted with null handling examples');
    }
  };

  const toggleGroup = (groupTitle: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupTitle)) {
      newExpanded.delete(groupTitle);
    } else {
      newExpanded.add(groupTitle);
    }
    setExpandedGroups(newExpanded);
  };

  const variableGroups: VariableGroup[] = [
    {
      title: 'General Information',
      variables: [
        { name: '{{employee.firstName}}', description: 'First name', type: 'string' },
        { name: '{{employee.lastName}}', description: 'Last name', type: 'string' },
        { name: '{{employee.email}}', description: 'Email address (may be null)', type: 'string' },
        { name: '{{employee.employeeId}}', description: 'Employee ID', type: 'string' },
        { name: '{{employee.biography}}', description: 'Biography (may be null)', type: 'string' },
        { name: '{{employee.currentDesignation}}', description: 'Current designation (may be null)', type: 'string' },
        { name: '{{employee.profileImage}}', description: 'Profile image URL (may be null)', type: 'string' },
      ]
    },
    {
      title: 'Technical Skills',
      variables: [
        { 
          name: '{{#each employee.technicalSkills}}', 
          description: 'Loop through technical skills (array may be empty)', 
          type: 'array',
          example: '{{this.name}} - {{this.proficiency}}/10'
        },
        { name: '{{this.name}}', description: 'Skill name (inside loop)', type: 'string' },
        { name: '{{this.proficiency}}', description: 'Proficiency level 1-10 (inside loop)', type: 'string' },
      ]
    },
    {
      title: 'Specialized Skills',
      variables: [
        { 
          name: '{{#each employee.specializedSkills}}', 
          description: 'Loop through specialized skills (array may be empty)', 
          type: 'array',
          example: '{{this.name}} - {{this.proficiency}}/10'
        },
        { name: '{{this.name}}', description: 'Skill name (inside loop)', type: 'string' },
        { name: '{{this.proficiency}}', description: 'Proficiency level 1-10 (inside loop)', type: 'string' },
      ]
    },
    {
      title: 'Work Experience',
      variables: [
        { 
          name: '{{#each employee.experiences}}', 
          description: 'Loop through work experiences (array may be empty)', 
          type: 'array'
        },
        { name: '{{this.companyName}}', description: 'Company name (inside loop)', type: 'string' },
        { name: '{{this.designation}}', description: 'Job title (inside loop)', type: 'string' },
        { name: '{{this.startDate}}', description: 'Start date (inside loop)', type: 'string' },
        { name: '{{this.endDate}}', description: 'End date (inside loop, may be empty for current jobs)', type: 'string' },
        { name: '{{this.description}}', description: 'Job description (inside loop, may be empty)', type: 'string' },
      ]
    },
    {
      title: 'Education',
      variables: [
        { 
          name: '{{#each employee.education}}', 
          description: 'Loop through education (array may be empty)', 
          type: 'array'
        },
        { name: '{{this.university}}', description: 'University name (inside loop)', type: 'string' },
        { name: '{{this.degree}}', description: 'Degree (inside loop)', type: 'string' },
        { name: '{{this.department}}', description: 'Department (inside loop)', type: 'string' },
        { name: '{{this.startDate}}', description: 'Start date (inside loop)', type: 'string' },
        { name: '{{this.endDate}}', description: 'End date (inside loop, may be empty for current studies)', type: 'string' },
        { name: '{{this.gpa}}', description: 'GPA (inside loop, may be empty)', type: 'string' },
      ]
    },
    {
      title: 'Projects',
      variables: [
        { 
          name: '{{#each employee.projects}}', 
          description: 'Loop through projects (array may be empty)', 
          type: 'array'
        },
        { name: '{{this.name}}', description: 'Project name (inside loop)', type: 'string' },
        { name: '{{this.role}}', description: 'Role in project (inside loop, may be empty)', type: 'string' },
        { name: '{{this.description}}', description: 'Project description (inside loop, may be empty)', type: 'string' },
        { name: '{{this.responsibility}}', description: 'Responsibilities (inside loop, may be empty)', type: 'string' },
        { name: '{{this.startDate}}', description: 'Project start date (inside loop)', type: 'string' },
        { name: '{{this.endDate}}', description: 'Project end date (inside loop, may be empty for ongoing)', type: 'string' },
        { name: '{{this.isCurrent}}', description: 'Whether project is current/ongoing (inside loop)', type: 'string' },
        { name: '{{this.url}}', description: 'Project URL/link (inside loop, may be empty)', type: 'string' },
        { name: '{{this.technologiesUsed}}', description: 'Technologies used (inside loop, array may be empty)', type: 'array' },
      ]
    },
    {
      title: 'Achievements',
      variables: [
        { 
          name: '{{#each employee.achievements}}', 
          description: 'Loop through achievements (array may be empty)', 
          type: 'array'
        },
        { name: '{{this.title}}', description: 'Achievement title (inside loop)', type: 'string' },
        { name: '{{this.date}}', description: 'Achievement date (inside loop, may be empty)', type: 'string' },
        { name: '{{this.description}}', description: 'Achievement description (inside loop, may be empty)', type: 'string' },
      ]
    },
    {
      title: 'Training & Certifications',
      variables: [
        { 
          name: '{{#each employee.trainings}}', 
          description: 'Loop through trainings (array may be empty)', 
          type: 'array'
        },
        { name: '{{this.title}}', description: 'Training title (inside loop)', type: 'string' },
        { name: '{{this.provider}}', description: 'Training provider (inside loop, may be empty)', type: 'string' },
        { name: '{{this.certificationDate}}', description: 'Certification date (inside loop, may be empty)', type: 'string' },
        { name: '{{this.certificateUrl}}', description: 'Certificate URL (inside loop, may be empty)', type: 'string' },
      ]
    }
  ];

  const VariablesTab = () => (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-2">
        {/* Action Buttons */}
        <div className="mb-4 space-y-2">
          <Button
            onClick={copyAIPrompt}
            className="w-full"
            variant="outline"
          >
            <Bot className="h-4 w-4 mr-2" />
            Copy AI Prompt
          </Button>
          
          {onInsertExample && (
            <Button
              onClick={insertEnhancedTemplate}
              className="w-full"
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Insert Enhanced Template
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground px-1">
            Generate AI prompts or use the enhanced template with proper null handling
          </p>
        </div>

        {/* Null Handling Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Null Handling</h4>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Use <code>{'{{#ifNotEmpty}}'}</code> to check if content exists</li>
            <li>• Use <code>{'{{#unless}}'}</code> for fallback content</li>
            <li>• Use filters like <code>{'| defaultValue:"fallback"'}</code></li>
            <li>• Arrays automatically return empty if null</li>
          </ul>
        </div>

        {variableGroups.map((group) => (
          <div key={group.title} className="border rounded-md">
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-sm">{group.title}</span>
              {expandedGroups.has(group.title) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedGroups.has(group.title) && (
              <div className="px-3 pb-3 space-y-2">
                {group.variables.map((variable) => (
                  <div key={variable.name} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-auto p-1 font-mono text-xs flex-1 justify-start"
                        onClick={() => copyToClipboard(variable.name)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {variable.name}
                      </Button>
                      <Badge variant="outline" className="text-xs">
                        {variable.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground pl-2">
                      {variable.description}
                    </p>
                    {variable.example && (
                      <code className="text-xs bg-muted/50 px-2 py-1 rounded block ml-2">
                        {variable.example}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {selectedEmployeeId && employeeData && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-sm font-medium text-green-800 mb-2">Live Data Available</h4>
            <p className="text-xs text-green-600">
              Template will use real data from {employeeData.general_information?.first_name} {employeeData.general_information?.last_name}
            </p>
          </div>
        )}

        {!selectedEmployeeId && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Preview Mode</h4>
            <p className="text-xs text-blue-600">
              Select an employee above to see variables populated with real data
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-medium text-sm">Template Helper</h3>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="variables" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-3 mt-3">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="structure">Structure Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="flex-1 m-0">
            <VariablesTab />
          </TabsContent>

          <TabsContent value="structure" className="flex-1 m-0">
            <TemplateStructureGuide onInsertExample={onInsertExample} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
