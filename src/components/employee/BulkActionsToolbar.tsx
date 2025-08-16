
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Download, 
  Mail, 
  CheckSquare, 
  Square,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BulkEmailModal from './BulkEmailModal';

interface BulkActionsToolbarProps {
  selectedProfiles: string[];
  totalProfiles: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkEmail: (profileIds: string[]) => void;
  onBulkExport: (profileIds: string[], format: 'csv' | 'excel' | 'pdf') => void;
  isAllSelected: boolean;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedProfiles,
  totalProfiles,
  onSelectAll,
  onClearSelection,
  onBulkEmail,
  onBulkExport,
  isAllSelected
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);

  const handleExport = () => {
    onBulkExport(selectedProfiles, exportFormat);
  };

  const handleBulkEmailClick = () => {
    setIsBulkEmailModalOpen(true);
  };

  if (selectedProfiles.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={isAllSelected ? onClearSelection : onSelectAll}
                className="h-8 w-8 p-0"
              >
                {isAllSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
              <span className="text-sm font-medium">
                {selectedProfiles.length} of {totalProfiles} selected
              </span>
              {selectedProfiles.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedProfiles.length}
                </Badge>
              )}
            </div>

            <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-xs"
            >
              Clear Selection
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Actions */}
            <div className="flex items-center gap-2">
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'pdf') => setExportFormat(value)}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-3 w-3" />
                      Excel
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      PDF
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>

            {/* Bulk Email */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkEmailClick}
              className="h-8"
            >
              <Mail className="h-3 w-3 mr-1" />
              Email All
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  More Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log('Generate CV reports')}>
                  Generate CV Reports
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Create team')}>
                  Create Team
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Assign to project')}>
                  Assign to Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Skills analysis')}>
                  Skills Analysis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <BulkEmailModal
        isOpen={isBulkEmailModalOpen}
        onClose={() => setIsBulkEmailModalOpen(false)}
        selectedProfiles={selectedProfiles}
        profilesCount={selectedProfiles.length}
      />
    </>
  );
};

export default BulkActionsToolbar;
