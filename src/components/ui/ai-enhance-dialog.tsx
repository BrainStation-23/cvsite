
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { useAiEnhance } from '@/hooks/use-ai-enhance';

interface AiEnhanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEnhanced: (enhancedText: string) => void;
  originalContent: string;
  defaultRequirements: string;
  title?: string;
  description?: string;
}

export const AiEnhanceDialog: React.FC<AiEnhanceDialogProps> = ({
  isOpen,
  onClose,
  onEnhanced,
  originalContent,
  defaultRequirements,
  title = 'Enhance with AI',
  description = 'Review the requirements and enhance your content with AI.'
}) => {
  const [requirements, setRequirements] = useState(defaultRequirements);
  const { enhanceText, isEnhancing } = useAiEnhance();

  const handleEnhance = async () => {
    const enhancedText = await enhanceText(originalContent, requirements);
    if (enhancedText) {
      onEnhanced(enhancedText);
      onClose();
    }
  };

  const handleClose = () => {
    setRequirements(defaultRequirements);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="original-content" className="text-sm font-medium">
              Original Content
            </Label>
            <Textarea
              id="original-content"
              value={originalContent}
              readOnly
              className="mt-1 bg-gray-50 resize-none"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="requirements" className="text-sm font-medium">
              Enhancement Requirements
            </Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Enter specific requirements for enhancement..."
              className="mt-1 resize-none"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isEnhancing}>
            Cancel
          </Button>
          <Button onClick={handleEnhance} disabled={isEnhancing || !requirements.trim()}>
            {isEnhancing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Enhance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
