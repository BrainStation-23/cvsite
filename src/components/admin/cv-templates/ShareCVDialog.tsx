
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Copy, ExternalLink, Calendar, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { generatePublicCVLink, copyPublicCVLink, openPublicCVLink } from '@/utils/public-cv-link-utility';

interface ShareCVDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
}

interface TokenData {
  token: string;
  publicUrl: string;
  expiresAt: string;
}

export const ShareCVDialog: React.FC<ShareCVDialogProps> = ({
  isOpen,
  onClose,
  templateId
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [hasUsageLimit, setHasUsageLimit] = useState(false);
  const [maxUsage, setMaxUsage] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<TokenData | null>(null);

  // Fetch profiles for selection
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles-for-sharing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, employee_id')
        .order('first_name');

      if (error) throw error;
      return data;
    },
    enabled: isOpen
  });

  const handleGenerateToken = async () => {
    if (!selectedProfileId) {
      return; // Error will be shown by the utility
    }

    setIsGenerating(true);
    
    try {
      const result = await generatePublicCVLink(selectedProfileId, templateId, {
        expiresInDays,
        maxUsage: hasUsageLimit ? maxUsage : null,
        copyToClipboard: false,
        showSuccessToast: true
      });

      if (result.success && result.token && result.publicUrl && result.expiresAt) {
        setGeneratedToken({
          token: result.token,
          publicUrl: result.publicUrl,
          expiresAt: result.expiresAt
        });
      }
    } catch (error) {
      console.error('Error in handleGenerateToken:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedToken) {
      copyPublicCVLink(generatedToken.publicUrl);
    }
  };

  const handleOpenPreview = () => {
    if (generatedToken) {
      openPublicCVLink(generatedToken.publicUrl);
    }
  };

  const handleClose = () => {
    setGeneratedToken(null);
    setSelectedProfileId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Public CV Preview Link</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!generatedToken ? (
            <>
              {/* Profile Selection */}
              <div className="space-y-2">
                <Label>Select Profile</Label>
                <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a profile..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profilesLoading ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Loading profiles...
                      </div>
                    ) : profiles && profiles.length > 0 ? (
                      profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.first_name} {profile.last_name} ({profile.employee_id})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No profiles found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Expiration Settings */}
              <div className="space-y-2">
                <Label htmlFor="expires-in">Expires In (Days)</Label>
                <Input
                  id="expires-in"
                  type="number"
                  min="1"
                  max="365"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 7)}
                />
              </div>

              {/* Usage Limit Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="usage-limit">Limit number of views</Label>
                  <Switch
                    id="usage-limit"
                    checked={hasUsageLimit}
                    onCheckedChange={setHasUsageLimit}
                  />
                </div>

                {hasUsageLimit && (
                  <div className="space-y-2">
                    <Label htmlFor="max-usage">Maximum Views</Label>
                    <Input
                      id="max-usage"
                      type="number"
                      min="1"
                      max="1000"
                      value={maxUsage}
                      onChange={(e) => setMaxUsage(parseInt(e.target.value) || 10)}
                    />
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerateToken} 
                disabled={isGenerating || !selectedProfileId}
                className="w-full"
              >
                {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate Public Link
              </Button>
            </>
          ) : (
            <>
              {/* Generated Link Display */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Public Preview Link Generated</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Expires: {new Date(generatedToken.expiresAt).toLocaleDateString()}
                    </div>
                    {hasUsageLimit && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Max views: {maxUsage}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Share this link:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedToken.publicUrl}
                      readOnly
                      className="text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleOpenPreview}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-amber-50 rounded border border-amber-200">
                  <strong>Note:</strong> This link provides access to masked employee data only. 
                  Sensitive information is automatically hidden for privacy protection.
                </div>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
