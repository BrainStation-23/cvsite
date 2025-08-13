
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { ProfileCombobox } from './ProfileCombobox';
import { BillTypeCombobox } from './BillTypeCombobox';
import { ProjectCombobox } from './ProjectCombobox';

interface ResourceAssignmentFormProps {
  profileId: string;
  setProfileId: (value: string) => void;
  billTypeId: string;
  setBillTypeId: (value: string) => void;
  projectId: string;
  setProjectId: (value: string) => void;
  engagementPercentage: string;
  setEngagementPercentage: (value: string) => void;
  billingPercentage: string;
  setBillingPercentage: (value: string) => void;
  engagementStartDate: Date;
  setEngagementStartDate: (value: Date) => void;
  releaseDate: Date;
  setReleaseDate: (value: Date) => void;
  weeklyValidation: boolean;
  setWeeklyValidation: (value: boolean) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ResourceAssignmentForm: React.FC<ResourceAssignmentFormProps> = ({
  profileId,
  setProfileId,
  billTypeId,
  setBillTypeId,
  projectId,
  setProjectId,
  engagementPercentage,
  setEngagementPercentage,
  billingPercentage,
  setBillingPercentage,
  engagementStartDate,
  setEngagementStartDate,
  releaseDate,
  setReleaseDate,
  weeklyValidation,
  setWeeklyValidation,
  onSubmit,
  isLoading
}) => {
  const form = useForm();

  const handleEngagementStartDateSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setEngagementStartDate(date);
    }
  };

  const handleReleaseDateSelect = (date: Date | Date[] | undefined) => {
    if (date && !Array.isArray(date)) {
      setReleaseDate(date);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <ProfileCombobox
                value={profileId}
                onValueChange={setProfileId}
                placeholder="Select employee"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Bill Type</FormLabel>
              <BillTypeCombobox
                value={billTypeId}
                onValueChange={setBillTypeId}
                placeholder="Select bill type"
              />
            </FormItem>

            <FormItem>
              <FormLabel>Project</FormLabel>
              <ProjectCombobox
                value={projectId}
                onValueChange={setProjectId}
                placeholder="Select project"
              />
            </FormItem>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Engagement Percentage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Engagement %"
                    value={engagementPercentage}
                    onChange={(e) => setEngagementPercentage(e.target.value)}
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Billing Percentage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Billing %"
                    value={billingPercentage}
                    onChange={(e) => setBillingPercentage(e.target.value)}
                  />
                </FormControl>
              </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Engagement Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !engagementStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {engagementStartDate ? format(engagementStartDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={engagementStartDate}
                      onSelect={handleEngagementStartDateSelect}
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>

              <FormItem>
                <FormLabel>Release Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !releaseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {releaseDate ? format(releaseDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={releaseDate}
                      onSelect={handleReleaseDateSelect}
                      disabled={(date) => 
                        engagementStartDate ? date < engagementStartDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Assigning...' : 'Assign Resource'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
