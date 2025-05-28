
import { useCVTemplateFetching } from './cv-templates/use-cv-template-fetching';
import { useCVTemplateOperations } from './cv-templates/use-cv-template-operations';

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
