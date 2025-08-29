
import { MappedEmployeeData } from './template-data-mapper';
import { applyUtilityFilter } from './template-utilities';
import { generateFullCVHTML } from './cv-html-generator';

interface TemplateProcessorOptions {
  debugMode?: boolean;
}

export class TemplateProcessor {
  private debugMode: boolean;

  constructor(options: TemplateProcessorOptions = {}) {
    this.debugMode = options.debugMode || false;
  }

  private log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[TemplateProcessor] ${message}`, data);
    }
  }

  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  private hasContent(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  }

  private processVariable(template: string, data: MappedEmployeeData): string {
    // Handle variables with filters: {{employee.firstName | capitalize}}
    return template.replace(/\{\{employee\.([^}|\s]+)(\s*\|\s*([^}]+))?\}\}/g, (match, path, filterPart, filter) => {
      const value = this.getValue(data, path);
      this.log(`Processing variable: employee.${path}`, { value, filter });
      
      if (filter) {
        return applyUtilityFilter(value, filter.trim());
      }
      
      return String(value || '');
    });
  }

  private processLoopVariable(template: string, item: any, index: number): string {
    // Handle {{this.property}} and {{this.property | filter}}
    let processed = template.replace(/\{\{this\.([^}|\s]+)(\s*\|\s*([^}]+))?\}\}/g, (match, property, filterPart, filter) => {
      let value = item[property];
      
      // Handle special cases
      if (property === 'dateRange') {
        value = applyUtilityFilter(item.startDate, 'formatDateRange', [item.endDate, String(item.isCurrent)]);
      }
      
      this.log(`Processing loop variable: this.${property}`, { value, filter });
      
      if (filter) {
        return applyUtilityFilter(value, filter.trim());
      }
      
      // Handle arrays automatically
      if (Array.isArray(value)) {
        return applyUtilityFilter(value, 'join');
      }
      
      return String(value || '');
    });

    // Process conditionals within loop context (this. prefixed)
    processed = this.processLoopConditionals(processed, item);

    return processed;
  }

  private processLoopConditionals(template: string, item: any): string {
    // Handle {{#if this.property}} ... {{else}} ... {{/if}}
    template = template.replace(
      /\{\{#if this\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(item, path);
        this.log(`Processing loop conditional: this.${path}`, { value, hasValue: !!value });
        
        return value ? ifContent : elseContent;
      }
    );

    // Handle {{#unless this.property}} ... {{else}} ... {{/unless}}
    template = template.replace(
      /\{\{#unless this\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/unless\}\}/g,
      (match, path, unlessContent, elseContent = '') => {
        const value = this.getValue(item, path);
        this.log(`Processing loop unless conditional: this.${path}`, { value, hasValue: !!value });
        
        return !value ? unlessContent : elseContent;
      }
    );

    // Handle {{#ifNotEmpty this.property}} ... {{else}} ... {{/ifNotEmpty}}
    template = template.replace(
      /\{\{#ifNotEmpty this\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/ifNotEmpty\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(item, path);
        const hasContent = this.hasContent(value);
        this.log(`Processing loop ifNotEmpty conditional: this.${path}`, { value, hasContent });
        
        return hasContent ? ifContent : elseContent;
      }
    );

    // Handle {{#hasContent this.property}} ... {{else}} ... {{/hasContent}}
    template = template.replace(
      /\{\{#hasContent this\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/hasContent\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(item, path);
        const hasContent = this.hasContent(value);
        this.log(`Processing loop hasContent conditional: this.${path}`, { value, hasContent });
        
        return hasContent ? ifContent : elseContent;
      }
    );

    return template;
  }

  private processLoops(template: string, data: MappedEmployeeData): string {
    // Handle {{#each employee.arrayName}} ... {{/each}}
    return template.replace(
      /\{\{#each employee\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, arrayName, loopContent) => {
        const array = this.getValue(data, arrayName);
        this.log(`Processing loop: employee.${arrayName}`, { array, arrayLength: array?.length });
        
        if (!Array.isArray(array) || array.length === 0) {
          return '';
        }

        return array.map((item, index) => {
          return this.processLoopVariable(loopContent, item, index);
        }).join('');
      }
    );
  }

  private processConditionals(template: string, data: MappedEmployeeData): string {
    // Handle {{#if employee.property}} ... {{else}} ... {{/if}}
    template = template.replace(
      /\{\{#if employee\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(data, path);
        this.log(`Processing conditional: employee.${path}`, { value, hasValue: !!value });
        
        return value ? ifContent : elseContent;
      }
    );

    // Handle {{#unless employee.property}} ... {{else}} ... {{/unless}}
    template = template.replace(
      /\{\{#unless employee\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/unless\}\}/g,
      (match, path, unlessContent, elseContent = '') => {
        const value = this.getValue(data, path);
        this.log(`Processing unless conditional: employee.${path}`, { value, hasValue: !!value });
        
        return !value ? unlessContent : elseContent;
      }
    );

    // Handle {{#ifNotEmpty employee.property}} ... {{else}} ... {{/ifNotEmpty}}
    template = template.replace(
      /\{\{#ifNotEmpty employee\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/ifNotEmpty\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(data, path);
        const hasContent = this.hasContent(value);
        this.log(`Processing ifNotEmpty conditional: employee.${path}`, { value, hasContent });
        
        return hasContent ? ifContent : elseContent;
      }
    );

    // Handle {{#hasContent employee.property}} ... {{else}} ... {{/hasContent}}
    template = template.replace(
      /\{\{#hasContent employee\.([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/hasContent\}\}/g,
      (match, path, ifContent, elseContent = '') => {
        const value = this.getValue(data, path);
        const hasContent = this.hasContent(value);
        this.log(`Processing hasContent conditional: employee.${path}`, { value, hasContent });
        
        return hasContent ? ifContent : elseContent;
      }
    );

    return template;
  }

  private processHelpers(template: string, data: MappedEmployeeData): string {
    // Handle {{#ifEquals employee.property "value"}} ... {{else}} ... {{/ifEquals}}
    template = template.replace(
      /\{\{#ifEquals employee\.([^}]+) "([^"]+)"\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/ifEquals\}\}/g,
      (match, path, compareValue, ifContent, elseContent = '') => {
        const value = this.getValue(data, path);
        this.log(`Processing ifEquals: employee.${path} === "${compareValue}"`, { value, compareValue, matches: value === compareValue });
        
        return String(value) === compareValue ? ifContent : elseContent;
      }
    );

    return template;
  }

  private applyOrientationStyles(html: string, orientation: 'portrait' | 'landscape'): string {
    // Add orientation-specific CSS classes or styles
    const orientationClass = `cv-${orientation}`;
    
    // If there's a body tag, add the orientation class
    if (html.includes('<body')) {
      html = html.replace(
        /<body([^>]*)>/,
        `<body$1 class="${orientationClass}">`
      );
    } else {
      // If no body tag, wrap content in a div with orientation class
      html = `<div class="${orientationClass}">${html}</div>`;
    }
    
    // Add orientation-specific CSS
    const orientationCSS = orientation === 'landscape' 
      ? `
        <style>
          .cv-landscape {
            width: 100%;
            max-width: 297mm;
            min-height: 210mm;
          }
          @media print {
            .cv-landscape {
              page-orientation: landscape;
            }
          }
        </style>
      `
      : `
        <style>
          .cv-portrait {
            width: 100%;
            max-width: 210mm;
            min-height: 297mm;
          }
          @media print {
            .cv-portrait {
              page-orientation: portrait;
            }
          }
        </style>
      `;
    
    // Insert CSS before closing head tag or at the beginning
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${orientationCSS}</head>`);
    } else {
      html = orientationCSS + html;
    }
    
    return html;
  }

  process(template: string, data: MappedEmployeeData): string {
    if (!template) return '';

    this.log('Starting template processing', { templateLength: template.length, hasData: !!data });

    try {
      let processed = template;

      // CRITICAL: Process loops FIRST, then conditionals
      // This ensures that conditionals within loops work correctly
      processed = this.processLoops(processed, data);
      processed = this.processConditionals(processed, data);
      processed = this.processHelpers(processed, data);
      processed = this.processVariable(processed, data);

      this.log('Template processing completed', { processedLength: processed.length });
      
      return processed;
    } catch (error) {
      this.log('Template processing error', error);
      throw new Error(`Template processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  processForCV(htmlTemplate: string, employeeData: any, templateConfig?: { orientation?: 'portrait' | 'landscape' }): string {
    const processed = this.process(htmlTemplate, employeeData);
    
    // Apply orientation-specific styling if template config is provided
    let processedHTML = processed;
    if (templateConfig?.orientation) {
      processedHTML = this.applyOrientationStyles(processedHTML, templateConfig.orientation);
    }
    
    return generateFullCVHTML(processedHTML, 'download');
  }
}
