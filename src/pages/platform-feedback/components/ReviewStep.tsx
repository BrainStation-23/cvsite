import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAiEnhance } from '@/hooks/use-ai-enhance';
import { toast } from 'sonner';
import type { FeedbackType } from '../types/feedback';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewStepProps {
  type: FeedbackType;
  formData: any; // BugReportFormValues | FeatureRequestFormValues
  onBack: () => void;
}

export default function ReviewStep({ type, formData, onBack }: ReviewStepProps) {
  const { enhanceText, isEnhancing } = useAiEnhance();
  const [title, setTitle] = useState<string>(formData?.title || '');
  const [enhancedMarkdown, setEnhancedMarkdown] = useState<string>('');

  const originalContent = useMemo(() => {
    if (type === 'bug') {
      const browser = formData?.browser || 'Unknown';
      const os = formData?.os || 'Unknown';
      const device = formData?.device || 'Unknown';
      return `Bug Report\n\nTitle: ${formData?.title || ''}\nPage URL: ${formData?.pageUrl || ''}\n\nSteps to Reproduce:\n${formData?.stepsToReproduce || ''}\n\nExpected Behavior:\n${formData?.expectedBehavior || ''}\n\nActual Behavior:\n${formData?.actualBehavior || ''}\n\nEnvironment:\nBrowser: ${browser}\nOS: ${os}\nDevice: ${device}`.trim();
    }
    // feature
    return `Feature Request\n\nTitle: ${formData?.title || ''}\nArea: ${formData?.area || ''}\n\nUser Story:\nAs ${formData?.userStory?.as || ''}, I want ${formData?.userStory?.want || ''} so that ${formData?.userStory?.soThat || ''}.\n\nBenefit:\n${formData?.benefit || ''}\n\nReference:\n${formData?.references || ''}`.trim();
  }, [type, formData]);

  const requirements = useMemo(() => {
    if (type === 'bug') {
      return `Rewrite the provided bug report into a clean, well-structured GitHub issue markdown.\nInclude the following sections with proper headings: \n- Summary (1-2 sentences)\n- Steps to Reproduce (numbered list)\n- Expected Behavior\n- Actual Behavior\n- Affected URL\n- Environment (use the provided Browser/OS/Device if available, otherwise leave placeholders)\nUse clear formatting and markdown best practices.`;
    }
    return `Rewrite the provided feature request into a clean, well-structured GitHub issue markdown.\nInclude the following sections with proper headings: \n- Summary\n- User Story (As a..., I want..., So that...)\n- Proposed Solution (bullet points, inferred if not provided)\n- Benefits / Impact\n- Scope & Considerations\n- References (links)\nUse clear formatting and markdown best practices.`;
  }, [type]);

  const generate = async () => {
    const result = await enhanceText(originalContent, requirements);
    if (result) setEnhancedMarkdown(result);
  };

  useEffect(() => {
    // Auto-generate once when entering review
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(enhancedMarkdown);
      toast.success('Markdown copied to clipboard');
    } catch {
      toast.error('Failed to copy markdown');
    }
  };

  const copyTitle = async () => {
    try {
      await navigator.clipboard.writeText(title);
      toast.success('Title copied to clipboard');
    } catch {
      toast.error('Failed to copy title');
    }
  };

  const openNewIssue = () => {
    const repoUrl = 'https://github.com/BrainStation-23/cvsite/issues/new';
    const params = new URLSearchParams({
      title: title,
      body: enhancedMarkdown,
      labels: type === 'bug' ? 'bug,platform-feedback' : 'enhancement,platform-feedback',
    });

    window.open(`${repoUrl}?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Review & Prepare GitHub Issue</h2>
          <p className="text-sm text-muted-foreground">We rewrote your input into a well-formatted markdown for GitHub issues.</p>
        </div>
        <Button variant="outline" onClick={onBack} disabled={isEnhancing}>Back</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Markdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3" aria-busy={isEnhancing && !enhancedMarkdown}>
          {isEnhancing && !enhancedMarkdown ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Spinner />
                <span>Generating markdown with AI…</span>
              </div>
              <Skeleton className="h-[260px] w-full" />
            </div>
          ) : (
            <Textarea className="min-h-[300px] font-mono" value={enhancedMarkdown} onChange={(e) => setEnhancedMarkdown(e.target.value)} />
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={generate} disabled={isEnhancing}>{isEnhancing ? 'Enhancing…' : 'Regenerate Markdown'}</Button>
            <Button variant="outline" onClick={openNewIssue}>Open GitHub New Issue</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
