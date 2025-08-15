
import { useState, useEffect, useMemo } from 'react';
import { mapEmployeeData, MappedEmployeeData } from '@/utils/template-data-mapper';
import { TemplateProcessor } from '@/utils/template-processor';

interface TemplateEngineResult {
  processedHTML: string;
  error: string | null;
  isProcessing: boolean;
  mappedData?: MappedEmployeeData;
}

export const useTemplateEngine = (
  htmlTemplate: string,
  employeeData: any,
  options?: { debugMode?: boolean }
): TemplateEngineResult => {
  const [processedHTML, setProcessedHTML] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processor = useMemo(() => {
    return new TemplateProcessor({ 
      debugMode: options?.debugMode || false 
    });
  }, [options?.debugMode]);

  const mappedData = useMemo(() => {
    return mapEmployeeData(employeeData);
  }, [employeeData]);

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
        
        const result = processor.process(htmlTemplate, mappedData);
        setProcessedHTML(result);
      } catch (err) {
        console.error('Template engine error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setProcessedHTML('');
      } finally {
        setIsProcessing(false);
      }
    };

    processTemplateAsync();
  }, [htmlTemplate, mappedData, processor]);

  return {
    processedHTML,
    error,
    isProcessing,
    mappedData
  };
};
