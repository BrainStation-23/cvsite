
import React, { useState } from 'react';
import { useEmployeeData } from '@/hooks/use-employee-data';
import { Button } from '@/components/ui/button';
import { Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TemplateVariableHelperProps {
  selectedEmployeeId: string | null;
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
}) => {
  const { data: employeeData } = useEmployeeData(selectedEmployeeId || '');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['general']));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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
        { name: '{{employee.email}}', description: 'Email address', type: 'string' },
        { name: '{{employee.employeeId}}', description: 'Employee ID', type: 'string' },
        { name: '{{employee.biography}}', description: 'Biography', type: 'string' },
        { name: '{{employee.currentDesignation}}', description: 'Current designation', type: 'string' },
        { name: '{{employee.profileImage}}', description: 'Profile image URL', type: 'string' },
      ]
    },
    {
      title: 'Technical Skills',
      variables: [
        { 
          name: '{{#each employee.technicalSkills}}', 
          description: 'Loop through technical skills', 
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
          description: 'Loop through work experiences', 
          type: 'array'
        },
        { name: '{{this.companyName}}', description: 'Company name (inside loop)', type: 'string' },
        { name: '{{this.designation}}', description: 'Job title (inside loop)', type: 'string' },
        { name: '{{this.startDate}}', description: 'Start date (inside loop)', type: 'string' },
        { name: '{{this.endDate}}', description: 'End date (inside loop)', type: 'string' },
        { name: '{{this.description}}', description: 'Job description (inside loop)', type: 'string' },
      ]
    },
    {
      title: 'Education',
      variables: [
        { 
          name: '{{#each employee.education}}', 
          description: 'Loop through education', 
          type: 'array'
        },
        { name: '{{this.university}}', description: 'University name (inside loop)', type: 'string' },
        { name: '{{this.degree}}', description: 'Degree (inside loop)', type: 'string' },
        { name: '{{this.department}}', description: 'Department (inside loop)', type: 'string' },
        { name: '{{this.startDate}}', description: 'Start date (inside loop)', type: 'string' },
        { name: '{{this.endDate}}', description: 'End date (inside loop)', type: 'string' },
        { name: '{{this.gpa}}', description: 'GPA (inside loop)', type: 'string' },
      ]
    },
    {
      title: 'Projects',
      variables: [
        { 
          name: '{{#each employee.projects}}', 
          description: 'Loop through projects', 
          type: 'array'
        },
        { name: '{{this.name}}', description: 'Project name (inside loop)', type: 'string' },
        { name: '{{this.role}}', description: 'Role in project (inside loop)', type: 'string' },
        { name: '{{this.description}}', description: 'Project description (inside loop)', type: 'string' },
        { name: '{{this.responsibility}}', description: 'Responsibilities (inside loop)', type: 'string' },
        { name: '{{this.technologiesUsed}}', description: 'Technologies used (inside loop)', type: 'array' },
      ]
    },
    {
      title: 'Training & Certifications',
      variables: [
        { 
          name: '{{#each employee.trainings}}', 
          description: 'Loop through trainings', 
          type: 'array'
        },
        { name: '{{this.title}}', description: 'Training title (inside loop)', type: 'string' },
        { name: '{{this.provider}}', description: 'Training provider (inside loop)', type: 'string' },
        { name: '{{this.certificationDate}}', description: 'Certification date (inside loop)', type: 'string' },
        { name: '{{this.certificateUrl}}', description: 'Certificate URL (inside loop)', type: 'string' },
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-medium text-sm">Template Variables</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Click to copy variable names to clipboard
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
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
    </div>
  );
};
