
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import ResourceTypeCombobox from '@/components/admin/user/ResourceTypeCombobox';

interface AddBillTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (value: {
    name: string;
    is_billable: boolean;
    is_support: boolean;
    non_billed: boolean;
    resource_type: string | null;
  }) => void;
  isAdding: boolean;
}

export const AddBillTypeModal: React.FC<AddBillTypeModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isAdding
}) => {
  const [name, setName] = useState('');
  const [isBillable, setIsBillable] = useState(false);
  const [isSupport, setIsSupport] = useState(false);
  const [nonBilled, setNonBilled] = useState(false);
  const [resourceType, setResourceType] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        name: name.trim(),
        is_billable: isBillable,
        is_support: isSupport,
        non_billed: nonBilled,
        resource_type: resourceType
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setIsBillable(false);
    setIsSupport(false);
    setNonBilled(false);
    setResourceType(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Bill Type</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="billTypeName" className="block text-sm font-medium mb-2">
                Bill Type Name
              </label>
              <Input
                id="billTypeName"
                placeholder="Enter bill type name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Resource Type
              </label>
              <ResourceTypeCombobox
                value={resourceType}
                onValueChange={setResourceType}
                placeholder="Select resource type..."
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="billable" className="text-sm font-medium">
                  Billable
                </label>
                <Switch
                  id="billable"
                  checked={isBillable}
                  onCheckedChange={setIsBillable}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="support" className="text-sm font-medium">
                  Support
                </label>
                <Switch
                  id="support"
                  checked={isSupport}
                  onCheckedChange={setIsSupport}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="nonBilled" className="text-sm font-medium">
                  Non-Billed
                </label>
                <Switch
                  id="nonBilled"
                  checked={nonBilled}
                  onCheckedChange={setNonBilled}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isAdding}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? 'Adding...' : 'Add Bill Type'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
