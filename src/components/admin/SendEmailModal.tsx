
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
import { useSendProfileEmail } from '@/hooks/use-send-profile-email';
import { useAuth } from '@/contexts/AuthContext';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    employee_id?: string;
    email?: string;
  };
}

interface CcOptions {
  includeSbuHead: boolean;
  includeHrContacts: boolean;
  includeMe: boolean;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  const { user } = useAuth();
  const { sendProfileEmail, isProfileSending } = useSendProfileEmail();
  
  const [ccOptions, setCcOptions] = useState<CcOptions>({
    includeSbuHead: false,
    includeHrContacts: false,
    includeMe: false
  });

  const handleSend = async () => {
    try {
      await sendProfileEmail({
        profileId: profile.id,
        ccOptions,
        userEmail: user?.email || undefined // Pass the authenticated user's email
      });
      onClose();
      // Reset options for next time
      setCcOptions({
        includeSbuHead: false,
        includeHrContacts: false,
        includeMe: false
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleClose = () => {
    if (!isProfileSending(profile.id)) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Profile Completion Email
          </DialogTitle>
          <DialogDescription>
            Send a profile completion reminder to{' '}
            <span className="font-medium">
              {profile.first_name} {profile.last_name}
            </span>{' '}
            ({profile.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">CC Options:</h4>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sbu-head"
                checked={ccOptions.includeSbuHead}
                onCheckedChange={(checked) =>
                  setCcOptions(prev => ({ ...prev, includeSbuHead: !!checked }))
                }
              />
              <label htmlFor="sbu-head" className="text-sm">
                CC SBU Head
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hr-contacts"
                checked={ccOptions.includeHrContacts}
                onCheckedChange={(checked) =>
                  setCcOptions(prev => ({ ...prev, includeHrContacts: !!checked }))
                }
              />
              <label htmlFor="hr-contacts" className="text-sm">
                CC HR Contacts
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cc-me"
                checked={ccOptions.includeMe}
                onCheckedChange={(checked) =>
                  setCcOptions(prev => ({ ...prev, includeMe: !!checked }))
                }
              />
              <label htmlFor="cc-me" className="text-sm">
                CC Me ({user?.email})
              </label>
            </div>
          </div>

          {(ccOptions.includeSbuHead || ccOptions.includeHrContacts || ccOptions.includeMe) && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <strong>Note:</strong> The selected recipients will receive a copy of the email.
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProfileSending(profile.id)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isProfileSending(profile.id)}
            className="gap-2"
          >
            {isProfileSending(profile.id) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailModal;
