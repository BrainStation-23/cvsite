
import { MappedEmployeeData } from './template-data-mapper';
import { applyUtilityFilter } from './template-utilities';

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
    return template.replace(/\{\{this\.([^}|\s]+)(\s*\|\s*([^}]+))?\}\}/g, (match, property, filterPart, filter) => {
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
    // Handle {{#if employee.property}} ... {{/if}}
    template = template.replace(
      /\{\{#if employee\.([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, path, content) => {
        const value = this.getValue(data, path);
        this.log(`Processing conditional: employee.${path}`, { value, hasValue: !!value });
        
        return value ? content : '';
      }
    );

    // Handle {{#unless employee.property}} ... {{/unless}}
    template = template.replace(
      /\{\{#unless employee\.([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g,
      (match, path, content) => {
        const value = this.getValue(data, path);
        this.log(`Processing unless conditional: employee.${path}`, { value, hasValue: !!value });
        
        return !value ? content : '';
      }
    );

    return template;
  }

  private processHelpers(template: string, data: MappedEmployeeData): string {
    // Handle {{#ifEquals employee.property "value"}} ... {{/ifEquals}}
    template = template.replace(
      /\{\{#ifEquals employee\.([^}]+) "([^"]+)"\}\}([\s\S]*?)\{\{\/ifEquals\}\}/g,
      (match, path, compareValue, content) => {
        const value = this.getValue(data, path);
        this.log(`Processing ifEquals: employee.${path} === "${compareValue}"`, { value, compareValue, matches: value === compareValue });
        
        return String(value) === compareValue ? content : '';
      }
    );

    return template;
  }

  process(template: string, data: MappedEmployeeData): string {
    if (!template) return '';

    this.log('Starting template processing', { templateLength: template.length, hasData: !!data });

    try {
      let processed = template;

      // Process in order of complexity
      processed = this.processConditionals(processed, data);
      processed = this.processHelpers(processed, data);
      processed = this.processLoops(processed, data);
      processed = this.processVariable(processed, data);

      this.log('Template processing completed', { processedLength: processed.length });
      
      return processed;
    } catch (error) {
      this.log('Template processing error', error);
      throw new Error(`Template processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
