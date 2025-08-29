
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export const ConditionalRenderingSection: React.FC = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
    toast.success('Copied to clipboard');
  };

  const conditionals = [
    {
      name: '{{#if}}',
      description: 'Renders content if the variable exists and is not empty',
      example: `{{#if employee.biography}}
  <div class="biography">
    <h3>About</h3>
    <p>{{employee.biography}}</p>
  </div>
{{/if}}`,
      useCase: 'Basic existence check'
    },
    {
      name: '{{#unless}}',
      description: 'Renders content if the variable does NOT exist or is empty',
      example: `{{#unless employee.profileImage}}
  <div class="no-image-placeholder">
    <span>No profile image available</span>
  </div>
{{/unless}}`,
      useCase: 'Fallback content for missing data'
    },
    {
      name: '{{#ifNotEmpty}}',
      description: 'Enhanced check - only renders if variable has meaningful content (not null, undefined, empty string, or empty array)',
      example: `{{#ifNotEmpty employee.technicalSkills}}
  <section class="skills">
    <h3>Technical Skills</h3>
    {{#each employee.technicalSkills}}
      <span>{{this.name}} ({{this.proficiency}}/10)</span>
    {{/each}}
  </section>
{{/ifNotEmpty}}`,
      useCase: 'Recommended for arrays and optional content'
    },
    {
      name: '{{#hasContent}}',
      description: 'Similar to ifNotEmpty but with stricter content validation',
      example: `{{#hasContent employee.biography}}
  <div class="summary">
    <h3>Professional Summary</h3>
    <p>{{employee.biography}}</p>
  </div>
{{/hasContent}}`,
      useCase: 'Strict content validation'
    },
    {
      name: '{{#ifEquals}}',
      description: 'Renders content if variable equals a specific value',
      example: `{{#ifEquals employee.currentDesignation "Senior Developer"}}
  <div class="senior-badge">
    <span class="badge">Senior Level</span>
  </div>
{{/ifEquals}}`,
      useCase: 'Role or status-based rendering'
    }
  ];

  const filters = [
    {
      name: 'defaultValue',
      description: 'Provides a fallback value if the original is null/empty',
      example: `<p>{{employee.biography | defaultValue:"No biography available"}}</p>`,
      useCase: 'Inline fallback values'
    },
    {
      name: 'formatDate',
      description: 'Formats dates with fallback for empty dates',
      example: `<span>{{this.startDate | formatDate:"MMM yyyy"}}</span>`,
      useCase: 'Date formatting with null handling'
    },
    {
      name: 'join',
      description: 'Joins arrays with separator, handles null arrays gracefully',
      example: `<p>Technologies: {{this.technologiesUsed | join:", "}}</p>`,
      useCase: 'Array display with safe handling'
    }
  ];

  const patterns = [
    {
      title: 'Optional Section Pattern',
      description: 'Only show entire sections if they have content',
      code: `{{#ifNotEmpty employee.achievements}}
<section class="cv-section" data-section="achievements">
  <h2 class="cv-section-header">Achievements</h2>
  <div class="cv-item-group">
    {{#each employee.achievements}}
    <div class="cv-item">
      <h4>{{this.title}}</h4>
      <span class="date">{{this.date | formatDate}}</span>
      <p>{{this.description}}</p>
    </div>
    {{/each}}
  </div>
</section>
{{/ifNotEmpty}}`
    },
    {
      title: 'Conditional Content with Fallback',
      description: 'Show primary content or fallback message',
      code: `<div class="contact-info">
  {{#if employee.email}}
    <p>Email: {{employee.email}}</p>
  {{else}}
    <p>Email: Contact HR for email address</p>
  {{/if}}
</div>`
    },
    {
      title: 'Safe Array Rendering',
      description: 'Handle potentially empty arrays gracefully',
      code: `{{#ifNotEmpty employee.technicalSkills}}
  <div class="skills-section">
    <h3>Technical Skills</h3>
    {{#each employee.technicalSkills}}
      <div class="skill-item">
        <span class="skill-name">{{this.name}}</span>
        <span class="proficiency">{{this.proficiency | formatProficiency}}</span>
      </div>
    {{/each}}
  </div>
{{/ifNotEmpty}}`
    },
    {
      title: 'Complex Conditional Logic',
      description: 'Combine multiple conditions for sophisticated rendering',
      code: `{{#if employee.experiences}}
  {{#each employee.experiences}}
    <div class="experience-item">
      <h3>{{this.designation}} at {{this.companyName}}</h3>
      <div class="duration">
        {{#if this.isCurrent}}
          {{this.startDate | formatDate}} - Present
        {{else}}
          {{#if this.endDate}}
            {{this.startDate | formatDate}} - {{this.endDate | formatDate}}
          {{else}}
            {{this.startDate | formatDate}}
          {{/if}}
        {{/if}}
      </div>
      {{#ifNotEmpty this.description}}
        <div class="description">{{this.description}}</div>
      {{/ifNotEmpty}}
    </div>
  {{/each}}
{{/if}}`
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Conditional Rendering & Null Handling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Null Variable Handling</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    All variables are automatically converted to empty strings if null/undefined. 
                    Use conditionals to control when content should be rendered.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Available Conditional Helpers</h4>
              <div className="space-y-4">
                {conditionals.map((conditional, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-sm">{conditional.name}</h5>
                        <p className="text-xs text-gray-600">{conditional.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(conditional.example, `conditional-${index}`)}
                      >
                        {copiedItem === `conditional-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded p-3 mt-2">
                      <pre className="text-xs overflow-x-auto">
                        <code>{conditional.example}</code>
                      </pre>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Use case: {conditional.useCase}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Utility Filters for Null Handling</h4>
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-sm">{filter.name}</h5>
                        <p className="text-xs text-gray-600">{filter.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(filter.example, `filter-${index}`)}
                      >
                        {copiedItem === `filter-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <code className="text-xs">{filter.example}</code>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">
                      {filter.useCase}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Common Patterns</h4>
              <div className="space-y-4">
                {patterns.map((pattern, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-sm">{pattern.title}</h5>
                        <p className="text-xs text-gray-600">{pattern.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(pattern.code, `pattern-${index}`)}
                      >
                        {copiedItem === `pattern-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded p-3 mt-2">
                      <pre className="text-xs overflow-x-auto">
                        <code>{pattern.code}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
