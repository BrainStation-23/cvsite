
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendEmailData {
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

export function useSendProfileEmail() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendProfileEmail = async (data: SendEmailData) => {
    setIsSending(true);
    
    try {
      console.log('Sending profile email to:', data.email);
      
      const { data: result, error } = await supabase.functions.invoke('send-profile-email', {
        body: data
      });

      if (error) {
        console.error('Error sending email:', error);
        throw error;
      }

      console.log('Email sent successfully:', result);
      
      toast({
        title: "Email sent successfully",
        description: `Profile completion email sent to ${data.firstName} ${data.lastName}`,
      });

      return result;
    } catch (error) {
      console.error('Error in sendProfileEmail:', error);
      toast({
        title: "Failed to send email",
        description: error.message || "There was an error sending the email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendProfileEmail,
    isSending
  };
}
