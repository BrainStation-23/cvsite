
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SendEmailData {
  profileId: string;
}

export function useSendProfileEmail() {
  const [sendingProfiles, setSendingProfiles] = useState<Set<string>>(new Set());

  const sendProfileEmail = async (data: SendEmailData) => {
    setSendingProfiles(prev => new Set([...prev, data.profileId]));
    
    try {
      console.log('Sending profile email for profile ID:', data.profileId);
      
      const { data: result, error } = await supabase.functions.invoke('send-profile-email', {
        body: data
      });

      if (error) {
        console.error('Error sending email:', error);
        throw error;
      }

      if (!result.success) {
        console.error('Email sending failed:', result.error);
        throw new Error(result.error || 'Failed to send email');
      }

      console.log('Email sent successfully:', result);
      
      toast.success(`Profile completion email sent to ${result.sentTo}`);

      return result;
    } catch (error: any) {
      console.error('Error in sendProfileEmail:', error);
      toast.error(error.message || "There was an error sending the email");
      throw error;
    } finally {
      setSendingProfiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.profileId);
        return newSet;
      });
    }
  };

  const isProfileSending = (profileId: string) => sendingProfiles.has(profileId);

  return {
    sendProfileEmail,
    isProfileSending
  };
}
