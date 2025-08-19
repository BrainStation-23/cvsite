
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Clock, Calendar, Info, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeeklyScoreCardCron } from '@/hooks/use-weekly-score-card-cron';

const WeeklyScoreCardScheduling: React.FC = () => {
  const { config, isLoading, updateCronJob, isUpdating } = useWeeklyScoreCardCron();
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customSchedule, setCustomSchedule] = useState('0 0 * * 1');

  // Preset schedules with human-friendly descriptions
  const schedulePresets = [
    { value: '0 0 * * 1', label: 'Every Monday at midnight', description: 'Weekly on Monday' },
    { value: '0 0 * * 0', label: 'Every Sunday at midnight', description: 'Weekly on Sunday' },
    { value: '0 6 * * 1', label: 'Every Monday at 6:00 AM', description: 'Weekly on Monday morning' },
    { value: '0 18 * * 5', label: 'Every Friday at 6:00 PM', description: 'Weekly on Friday evening' },
    { value: '0 0 1 * *', label: 'First day of every month at midnight', description: 'Monthly' },
    { value: 'custom', label: 'Custom schedule', description: 'Define your own cron expression' },
  ];

  // Update local state when config is loaded
  useEffect(() => {
    if (config) {
      setIsEnabled(config.is_enabled);
      setCustomSchedule(config.schedule);
      
      // Find matching preset or set to custom
      const matchingPreset = schedulePresets.find(preset => preset.value === config.schedule);
      setSelectedPreset(matchingPreset ? matchingPreset.value : 'custom');
    }
  }, [config]);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value !== 'custom') {
      setCustomSchedule(value);
    }
  };

  const handleSave = () => {
    updateCronJob({
      schedule: customSchedule,
      enabled: isEnabled,
    });
  };

  const getCurrentScheduleDescription = () => {
    const preset = schedulePresets.find(p => p.value === customSchedule);
    return preset ? preset.description : 'Custom schedule';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading cron job configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Score Card Scheduling
          </CardTitle>
          <CardDescription>
            Configure automatic weekly score card calculation using cron jobs. This will calculate and store weekly utilization metrics on the specified schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cron-enabled" className="text-base font-medium">
                Enable Scheduled Calculation
              </Label>
              <p className="text-sm text-muted-foreground">
                Turn on/off the automatic weekly score card calculation
              </p>
            </div>
            <Switch
              id="cron-enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          <Separator />

          {/* Schedule Configuration */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Schedule Configuration</Label>
            
            {/* Preset Selection */}
            <div className="space-y-2">
              <Label htmlFor="schedule-preset">Schedule Preset</Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a schedule preset" />
                </SelectTrigger>
                <SelectContent>
                  {schedulePresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <div className="flex flex-col">
                        <span>{preset.label}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Schedule Input */}
            {selectedPreset === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-schedule">Custom Cron Expression</Label>
                <Input
                  id="custom-schedule"
                  value={customSchedule}
                  onChange={(e) => setCustomSchedule(e.target.value)}
                  placeholder="0 0 * * 1"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Format: minute hour day month day-of-week (e.g., "0 0 * * 1" for every Monday at midnight)
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Current Status */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Current Status</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status:</span>
                <span className={isEnabled ? 'text-green-600' : 'text-red-600'}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Schedule:</span>
                <span>{getCurrentScheduleDescription()}</span>
              </div>
              {config?.updated_at && (
                <div className="flex items-center gap-2 col-span-1 md:col-span-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Last Updated:</span>
                  <span>{new Date(config.updated_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Warning Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This cron job will automatically calculate and store weekly score card data including utilization rates and resource distributions. 
              Make sure the schedule aligns with your reporting requirements.
            </AlertDescription>
          </Alert>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={isUpdating}
              className="min-w-[120px]"
            >
              {isUpdating ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyScoreCardScheduling;
