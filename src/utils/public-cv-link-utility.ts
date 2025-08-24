
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PublicCVLinkOptions {
  expiresInDays?: number;
  maxUsage?: number | null;
  copyToClipboard?: boolean;
  showSuccessToast?: boolean;
}

export interface PublicCVLinkResult {
  success: boolean;
  token?: string;
  publicUrl?: string;
  expiresAt?: string;
  error?: string;
}

export async function generatePublicCVLink(
  profileId: string,
  templateId: string,
  options: PublicCVLinkOptions = {}
): Promise<PublicCVLinkResult> {
  const { 
    expiresInDays = 7, 
    maxUsage = null, 
    copyToClipboard = false,
    showSuccessToast = true 
  } = options;
  
  try {
    console.log(`Generating public CV link for profile: ${profileId}, template: ${templateId}`);
    
    const { data, error } = await supabase.functions.invoke('generate-cv-preview-token', {
      body: {
        profileId,
        templateId,
        expiresInDays,
        maxUsage
      }
    });

    if (error) {
      console.error('Error generating public CV link:', error);
      const errorMessage = error.message || 'Failed to generate public preview link';
      
      if (showSuccessToast) {
        toast.error(errorMessage);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    if (!data.success) {
      console.error('Token generation failed:', data);
      const errorMessage = data.error || 'Failed to generate public preview link';
      
      if (showSuccessToast) {
        toast.error(errorMessage);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }

    // Copy to clipboard if requested
    if (copyToClipboard && data.publicUrl) {
      try {
        await navigator.clipboard.writeText(data.publicUrl);
        if (showSuccessToast) {
          toast.success('Link copied to clipboard');
        }
      } catch (clipboardError) {
        console.warn('Failed to copy to clipboard:', clipboardError);
        if (showSuccessToast) {
          toast.success('Public preview link generated successfully');
        }
      }
    } else if (showSuccessToast) {
      toast.success('Public preview link generated successfully');
    }

    return {
      success: true,
      token: data.token,
      publicUrl: data.publicUrl,
      expiresAt: data.expiresAt
    };

  } catch (error) {
    console.error('Public CV link generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (showSuccessToast) {
      toast.error(`Failed to generate public preview link: ${errorMessage}`);
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Convenience function for copying existing links
export async function copyPublicCVLink(publicUrl: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard');
    return true;
  } catch (error) {
    console.error('Failed to copy link:', error);
    toast.error('Failed to copy link to clipboard');
    return false;
  }
}

// Convenience function for opening links in new tab
export function openPublicCVLink(publicUrl: string): void {
  window.open(publicUrl, '_blank', 'noopener,noreferrer');
}
