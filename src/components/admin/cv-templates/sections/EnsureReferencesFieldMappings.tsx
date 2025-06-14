
import React, { useEffect } from 'react';
import { useReferencesFieldMappings } from '@/hooks/use-references-field-mappings';

interface EnsureReferencesFieldMappingsProps {
  templateId: string;
  onComplete?: () => void;
}

export const EnsureReferencesFieldMappings: React.FC<EnsureReferencesFieldMappingsProps> = ({
  templateId,
  onComplete
}) => {
  const { createReferencesFieldMappings, isLoading } = useReferencesFieldMappings();

  useEffect(() => {
    const ensureFieldMappings = async () => {
      if (templateId) {
        console.log('Ensuring references field mappings exist for template:', templateId);
        await createReferencesFieldMappings(templateId);
        if (onComplete) {
          onComplete();
        }
      }
    };

    ensureFieldMappings();
  }, [templateId, createReferencesFieldMappings, onComplete]);

  if (isLoading) {
    return (
      <div className="text-xs text-gray-500 p-2">
        Setting up references field mappings...
      </div>
    );
  }

  return null;
};
