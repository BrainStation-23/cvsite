import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const featureRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  area: z.string().min(1, 'Please select an area'),
  userStory: z.object({
    as: z.string().min(1, 'Required'),
    want: z.string().min(1, 'Required'),
    soThat: z.string().min(1, 'Required'),
  }),
  benefit: z.string().min(10, 'Please explain the benefit'),
  references: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
});

export type FeatureRequestFormValues = z.infer<typeof featureRequestSchema>;

interface FeatureRequestFormProps {
  onSubmit: (data: FeatureRequestFormValues) => void | Promise<void>;
  isSubmitting: boolean;
}

export function FeatureRequestForm({ onSubmit, isSubmitting }: FeatureRequestFormProps) {
  const form = useForm<FeatureRequestFormValues>({
    resolver: zodResolver(featureRequestSchema),
    defaultValues: {
      title: '',
      area: '',
      userStory: {
        as: 'a user',
        want: '',
        soThat: '',
      },
      benefit: '',
      references: '',
    },
  });

  const areas = [
    'User Interface',
    'User Experience',
    'Performance',
    'Security',
    'Reporting',
    'Integration',
    'Other',
  ];

  return (
    <Card className="mx-auto shadow-lg border bg-background max-w-8xl">
      <CardHeader className="flex flex-col items-center gap-2">
        <CardTitle className="text-2xl font-bold flex flex-row gap-2">
          <Lightbulb className="h-8 w-8 text-yellow-500" />
          Request a Feature
        </CardTitle>
        <span className="text-muted-foreground text-sm text-center">
          Share your ideas to help us improve! The more details you provide, the better we can understand your needs.
        </span>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Step 1: Feature details */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Step 1</span>
                  <span className="text-xs text-muted-foreground">Feature details</span>
                </div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feature Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="What would you like to see?" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Which area does this affect?</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select an area</option>
                          {areas.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4 rounded-lg border p-4 mt-4 bg-muted/10">
                  <h3 className="font-medium">User Story</h3>
                  <FormField
                    control={form.control}
                    name="userStory.as"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>As a...</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., project manager, team member" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userStory.want"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I want to...</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., filter reports by date range" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userStory.soThat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>So that...</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., I can analyze weekly performance" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* Step 2: Benefit & references */}
              <div className='flex justify-between flex-col'>
                <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Step 2</span>
                  <span className="text-xs text-muted-foreground">Benefit & References</span>
                </div>
                <FormField
                  control={form.control}
                  name="benefit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why is this valuable?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain how this feature would benefit users and the organization" 
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
                  name="references"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Links (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/similar-feature" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground mt-1">
                        Add any links to similar features or references that might help us understand your request.
                      </p>
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
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
