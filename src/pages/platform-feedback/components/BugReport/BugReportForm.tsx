import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// no external type imports needed here

const bugReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  pageUrl: z.string().url('Please enter a valid URL').or(z.literal('')),
  stepsToReproduce: z.string().min(10, 'Please provide detailed steps to reproduce'),
  expectedBehavior: z.string().min(10, 'Please describe the expected behavior'),
  actualBehavior: z.string().min(10, 'Please describe what actually happened'),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.string().optional(),
});

export type BugReportFormValues = z.infer<typeof bugReportSchema>;

interface BugReportFormProps {
  onSubmit: (data: BugReportFormValues) => void | Promise<void>;
  isSubmitting: boolean;
}

export function BugReportForm({ onSubmit, isSubmitting }: BugReportFormProps) {
  function detectBrowser(): string {
    if (typeof navigator === 'undefined') return '';
    const ua = navigator.userAgent;
    // Simple detection
    if (/edg\//i.test(ua)) return 'Microsoft Edge';
    if (/chrome\//i.test(ua)) return 'Chrome';
    if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return 'Safari';
    if (/firefox\//i.test(ua)) return 'Firefox';
    return ua;
  }

  function detectOS(): string {
    if (typeof navigator === 'undefined') return '';
    const ua = navigator.userAgent;
    if (/Windows NT/i.test(ua)) return 'Windows';
    if (/Mac OS X/i.test(ua)) return 'macOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return navigator.platform || 'Unknown';
  }

  function detectDevice(): string {
    if (typeof window === 'undefined') return '';
    const width = window.innerWidth;
    if (width < 768) return 'Mobile';
    if (width < 1024) return 'Tablet';
    return 'Desktop';
  }

  const form = useForm<BugReportFormValues>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      title: '',
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      browser: detectBrowser(),
      os: detectOS(),
      device: detectDevice(),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What's happening?</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Briefly describe the issue" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Where did you encounter this issue? (URL)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/page" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stepsToReproduce"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Steps to Reproduce</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={`1. Go to...\n2. Click on...\n3. Observe that...`}
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expectedBehavior"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Behavior</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What should have happened?" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="actualBehavior"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actual Behavior</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What actually happened?" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Environment</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                form.setValue('browser', detectBrowser());
                form.setValue('os', detectOS());
                form.setValue('device', detectDevice());
              }}
              disabled={isSubmitting}
            >
              Detect again
            </Button>
          </div>

          <FormField
            control={form.control}
            name="browser"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Browser</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Chrome 126" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="os"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Operating System</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Windows 11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="device"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Device</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Desktop / MacBook Pro / iPhone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Clear
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
