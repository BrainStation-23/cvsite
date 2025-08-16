
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CcOptions {
  includeSbuHead?: boolean;
  includeHrContacts?: boolean;
  includeMe?: boolean;
}

interface SendBulkEmailData {
  profileIds: string[];
  ccOptions?: CcOptions;
  userEmail?: string; // The authenticated user's email for CC
}

export function useSendBulkProfileEmails() {
  const [isSending, setIsSending] = useState(false);

  const sendBulkProfileEmails = async (data: SendBulkEmailData) => {
    setIsSending(true);
    
    try {
      console.log('Sending bulk profile emails for profile IDs:', data.profileIds);
      console.log('CC Options:', data.ccOptions);
      console.log('User Email for CC:', data.userEmail);
      
      const { data: result, error } = await supabase.functions.invoke('send-bulk-profile-emails', {
        body: data
      });

      if (error) {
        console.error('Error sending bulk emails:', error);
        throw error;
      }

      if (!result.success) {
        console.error('Bulk email sending failed:', result.error);
        throw new Error(result.error || 'Failed to send bulk emails');
      }

      console.log('Bulk emails sent successfully:', result);
      
      let successMessage = `Successfully sent ${result.successCount} emails`;
      if (result.failureCount > 0) {
        successMessage += ` (${result.failureCount} failed)`;
      }
      if (result.ccSent && result.ccSent.length > 0) {
        successMessage += ` with CC to: ${result.ccSent.join(', ')}`;
      }
      
      toast.success(successMessage);

      if (result.failedEmails && result.failedEmails.length > 0) {
        console.warn('Failed emails:', result.failedEmails);
        toast.warning(`Some emails failed to send. Check console for details.`);
      }

      return result;
    } catch (error: any) {
      console.error('Error in sendBulkProfileEmails:', error);
      toast.error(error.message || "There was an error sending the bulk emails");
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendBulkProfileEmails,
    isSending
  };
}
