
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FieldDisplayConfigTab from './config/FieldDisplayConfigTab';
import SectionTableMappingsTab from './config/SectionTableMappingsTab';

interface CVTemplateConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CVTemplateConfigDialog: React.FC<CVTemplateConfigDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState('field-display');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>CV Template Configuration</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="field-display">Field Display Config</TabsTrigger>
            <TabsTrigger value="section-mappings">Section Table Mappings</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 h-[70vh] overflow-auto">
            <TabsContent value="field-display">
              <FieldDisplayConfigTab />
            </TabsContent>
            
            <TabsContent value="section-mappings">
              <SectionTableMappingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CVTemplateConfigDialog;
