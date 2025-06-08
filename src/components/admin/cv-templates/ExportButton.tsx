
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

  // Debug the profile data being passed to export
  console.log('=== EXPORT BUTTON DEBUG ===');
  console.log('Export Button - Profile structure:', {
    hasProfile: !!profile,
    profileKeys: profile ? Object.keys(profile) : [],
    profileData: profile,
    // Check if it's the employee data structure or raw profile
    isEmployeeDataStructure: profile?.first_name !== undefined,
    // General info fields
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    email: profile?.email,
    phone: profile?.phone,
    location: profile?.location,
    designation: profile?.designation,
    biography: profile?.biography,
    profileImage: profile?.profile_image
  });

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
