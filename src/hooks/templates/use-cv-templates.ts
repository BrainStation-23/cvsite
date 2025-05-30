
import { useCVTemplateFetching } from './use-cv-template-fetching';
import { useCVTemplateOperations } from './use-cv-template-operations';

export const useCVTemplates = () => {
  const {
    templates,
    isLoading,
    fetchTemplates,
    getTemplate,
    refetch
  } = useCVTemplateFetching();

  const {
    isCreating,
    isUpdating,
    isDeleting,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useCVTemplateOperations();

  return {
    templates,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    getTemplates: fetchTemplates, // Alias for backward compatibility
    refetch
  };
};
