
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useTemplateReferences } from '@/hooks/use-template-references';

interface Reference {
  id: string;
  name: string;
  designation: string;
  company: string;
  email?: string;
  phone?: string;
}

interface ReferenceSectionConfigProps {
  sectionId: string;
  selectedReferences: string[];
  onUpdateSectionStyling: (id: string, styleUpdates: any) => void;
}

const ReferenceSectionConfig: React.FC<ReferenceSectionConfigProps> = ({
  sectionId,
  selectedReferences = [],
  onUpdateSectionStyling
}) => {
  const { references, isLoading } = useTemplateReferences();

  const handleReferenceToggle = (referenceId: string, checked: boolean) => {
    let updatedReferences;
    if (checked) {
      updatedReferences = [...selectedReferences, referenceId];
    } else {
      updatedReferences = selectedReferences.filter(id => id !== referenceId);
    }
    
    onUpdateSectionStyling(sectionId, { selected_references: updatedReferences });
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading references...</div>;
  }

  if (references.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Reference Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No references available. Please add references in the Platform Settings first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Reference Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-600">Select which references to include in this template:</p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {references.map((reference: Reference) => (
            <div key={reference.id} className="flex items-start space-x-2">
              <Checkbox
                id={`ref-${reference.id}`}
                checked={selectedReferences.includes(reference.id)}
                onCheckedChange={(checked) => 
                  handleReferenceToggle(reference.id, checked as boolean)
                }
              />
              <label 
                htmlFor={`ref-${reference.id}`}
                className="text-xs cursor-pointer flex-1"
              >
                <div className="font-medium">{reference.name}</div>
                <div className="text-gray-500">{reference.designation} at {reference.company}</div>
                {reference.email && (
                  <div className="text-gray-400">{reference.email}</div>
                )}
              </label>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          Selected: {selectedReferences.length} reference(s)
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferenceSectionConfig;
