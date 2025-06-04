
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import ExportModal from './ExportModal';

interface ExportButtonProps {
  template: any;
  profile: any;
  sections: any[];
  fieldMappings: any[];
  styles: any;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  template,
  profile,
  sections,
  fieldMappings,
  styles,
  disabled = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        size="sm"
        disabled={disabled || !profile}
        className="gap-2"
        onClick={() => setIsModalOpen(true)}
      >
        <Download className="h-4 w-4" />
        Export CV
      </Button>

      <ExportModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        template={template}
        profile={profile}
        sections={sections}
        fieldMappings={fieldMappings}
        styles={styles}
      />
    </>
  );
};

export default ExportButton;
