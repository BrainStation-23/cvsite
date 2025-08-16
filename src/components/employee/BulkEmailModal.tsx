
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail } from 'lucide-react';
import { useSendBulkProfileEmails } from '@/hooks/use-send-bulk-profile-emails';
import { useAuth } from '@/contexts/AuthContext';

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProfiles: string[];
  profilesCount: number;
}

interface CcOptions {
  includeSbuHead: boolean;
  includeHrContacts: boolean;
  includeMe: boolean;
}

const BulkEmailModal: React.FC<BulkEmailModalProps> = ({
  isOpen,
  onClose,
  selectedProfiles,
  profilesCount
}) => {
  const { user } = useAuth();
  const { sendBulkProfileEmails, isSending } = useSendBulkProfileEmails();
  
  const [ccOptions, setCcOptions] = useState<CcOptions>({
    includeSbuHead: false,
    includeHrContacts: false,
    includeMe: false
  });

  const handleSend = async () => {
    try {
      await sendBulkProfileEmails({
        profileIds: selectedProfiles,
        ccOptions,
        userEmail: user?.email || undefined
      });
      onClose();
      // Reset options for next time
      setCcOptions({
        includeSbuHead: false,
        includeHrContacts: false,
        includeMe: false
      });
    } catch (error) {
      console.error('Error sending bulk emails:', error);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Bulk Profile Completion Emails
          </DialogTitle>
          <DialogDescription>
            Send profile completion reminders to{' '}
            <span className="font-medium">
              {profilesCount} selected employees
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">CC Options:</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bulk-sbu-head"
                checked={ccOptions.includeSbuHead}
                onCheckedChange={(checked) =>
                  setCcOptions(prev => ({ ...prev, includeSbuHead: !!checked }))
                }
              />
              <label htmlFor="bulk-sbu-head" className="text-sm">
                CC SBU Heads
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bulk-hr-contacts"
                checked={ccOptions.includeHrContacts}
                onCheckedChange={(checked) =>
                  setCcOptions(prev => ({ ...prev, includeHrContacts: !!checked }))
                }
              />
              <label htmlFor="bulk-hr-contacts" className="text-sm">
                CC HR Contacts
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="bulk-cc-me"
                checked={ccOptions.includeMe}
                onCheckedChange={(checked) =>
                  setCcOptions(prev => ({ ...prev, includeMe: !!checked }))
                }
              />
              <label htmlFor="bulk-cc-me" className="text-sm">
                CC Me ({user?.email})
              </label>
            </div>
          </div>

          {(ccOptions.includeSbuHead || ccOptions.includeHrContacts || ccOptions.includeMe) && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <strong>Note:</strong> The selected recipients will receive a copy of all emails.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || selectedProfiles.length === 0}
            className="gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send {profilesCount} Emails
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkEmailModal;
