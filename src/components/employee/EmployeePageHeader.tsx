
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import BulkImportModal from './BulkImportModal';

const EmployeePageHeader: React.FC = () => {
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Comprehensive employee profiles with skills, experience, and more
        </p>
      </div>
      <div>
        <Button onClick={() => setIsBulkImportOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Bulk Import
        </Button>
      </div>
      
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />
    </div>
  );
};

export default EmployeePageHeader;
