
import { useState, useEffect, useMemo } from 'react';

interface TemplateEngineResult {
  processedHTML: string;
  error: string | null;
  isProcessing: boolean;
}

export const useTemplateEngine = (
  htmlTemplate: string,
  employeeData: any
): TemplateEngineResult => {
  const [processedHTML, setProcessedHTML] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processTemplate = useMemo(() => {
    return (template: string, data: any): string => {
      if (!template) return '';

      try {
        let processed = template;

        if (data) {
          // Create a flattened employee object for easier template access
          const employeeObj = {
            firstName: data.general_information?.first_name || '',
            lastName: data.general_information?.last_name || '',
            email: data.email || '',
            employeeId: data.employee_id || '',
            biography: data.general_information?.biography || '',
            currentDesignation: data.general_information?.current_designation || '',
            profileImage: data.general_information?.profile_image || '',
            technicalSkills: data.technical_skills || [],
            specializedSkills: data.specialized_skills || [],
            experiences: data.experiences || [],
            education: data.education || [],
            projects: data.projects || [],
            trainings: data.trainings || [],
            achievements: data.achievements || []
          };

          // Replace simple variables
          processed = processed.replace(/\{\{employee\.(\w+)\}\}/g, (match, property) => {
            const value = employeeObj[property as keyof typeof employeeObj];
            return value || '';
          });

          // Handle each loops
          processed = processed.replace(
            /\{\{#each employee\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
            (match, arrayName, loopContent) => {
              const array = employeeObj[arrayName as keyof typeof employeeObj];
              if (!Array.isArray(array)) return '';

              return array.map(item => {
                let itemContent = loopContent;
                
                // Replace {{this.property}} with actual values
                itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (match, prop) => {
                  if (prop === 'technologiesUsed' && Array.isArray(item[prop])) {
                    return item[prop].join(', ');
                  }
                  return item[prop] || '';
                });

                return itemContent;
              }).join('');
            }
          );

          // Handle conditional statements (basic implementation)
          processed = processed.replace(
            /\{\{#if employee\.(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
            (match, property, content) => {
              const value = employeeObj[property as keyof typeof employeeObj];
              return value ? content : '';
            }
          );
        } else {
          // If no data, show placeholder values
          processed = processed.replace(/\{\{employee\.(\w+)\}\}/g, (match, property) => {
            return `[${property}]`;
          });

          // Remove loops when no data
          processed = processed.replace(/\{\{#each employee\.(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, '');
        }

        return processed;
      } catch (err) {
        throw new Error(`Template processing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
  }, []);

  useEffect(() => {
    const processTemplateAsync = async () => {
      if (!htmlTemplate.trim()) {
        setProcessedHTML('');
        setError(null);
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Add a small delay to debounce rapid changes
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const result = processTemplate(htmlTemplate, employeeData);
        setProcessedHTML(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setProcessedHTML('');
      } finally {
        setIsProcessing(false);
      }
    };

    processTemplateAsync();
  }, [htmlTemplate, employeeData, processTemplate]);

  return {
    processedHTML,
    error,
    isProcessing
  };
};
