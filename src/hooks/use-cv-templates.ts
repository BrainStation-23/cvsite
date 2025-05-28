
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
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useCVTemplateOperations();

  return {
    templates,
    isLoading,
    isCreating,
    isUpdating,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    refetch
  };
};
