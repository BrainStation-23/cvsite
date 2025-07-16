
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image } from 'lucide-react';
import BulkImportModal from './BulkImportModal';
import BulkImageImportModal from './BulkImageImportModal';

const EmployeePageHeader: React.FC = () => {
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isBulkImageImportOpen, setIsBulkImageImportOpen] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Comprehensive employee profiles with skills, experience, and more
        </p>
      </div>
      <div className="space-x-2">
        <Button onClick={() => setIsBulkImportOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Bulk Import Data
        </Button>
        <Button onClick={() => setIsBulkImageImportOpen(true)}>
          <Image className="h-4 w-4 mr-2" />
          Bulk Import Images
        </Button>
      </div>
      
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />
      <BulkImageImportModal
        isOpen={isBulkImageImportOpen}
        onClose={() => setIsBulkImageImportOpen(false)}
      />
    </div>
  );
};

export default EmployeePageHeader;
