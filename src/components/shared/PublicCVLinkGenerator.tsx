
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share, Loader2 } from 'lucide-react';
import { generatePublicCVLink } from '@/utils/public-cv-link-utility';

interface PublicCVLinkGeneratorProps {
  profileId: string;
  templateId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  expiresInDays?: number;
  maxUsage?: number | null;
  copyToClipboard?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const PublicCVLinkGenerator: React.FC<PublicCVLinkGeneratorProps> = ({
  profileId,
  templateId,
  variant = 'outline',
  size = 'default',
  expiresInDays = 7,
  maxUsage = null,
  copyToClipboard = true,
  children,
  className
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLink = async () => {
    if (!profileId || !templateId) {
      return;
    }

    setIsGenerating(true);
    
    try {
      await generatePublicCVLink(profileId, templateId, {
        expiresInDays,
        maxUsage,
        copyToClipboard,
        showSuccessToast: true
      });
    } catch (error) {
      console.error('Error generating public CV link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGenerateLink}
      disabled={isGenerating || !profileId || !templateId}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Share className="h-4 w-4 mr-2" />
      )}
      {children || 'Share CV Link'}
    </Button>
  );
};
