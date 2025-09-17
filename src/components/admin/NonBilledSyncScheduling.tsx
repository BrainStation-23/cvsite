import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useNonBilledSyncCron } from '@/hooks/use-non-billed-sync-cron';
import { Loader2, Clock, Info } from 'lucide-react';

const NonBilledSyncScheduling: React.FC = () => {
  const { config, isLoading, updateCronJob, isUpdating } = useNonBilledSyncCron();
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customSchedule, setCustomSchedule] = useState('');

  // Predefined schedule options
  const schedulePresets = [
    { value: '0 */6 * * *', label: 'Every 6 hours', description: 'Runs at 00:00, 06:00, 12:00, 18:00' },
    { value: '0 8 * * *', label: 'Daily at 8 AM', description: 'Runs every day at 8:00 AM' },
    { value: '0 20 * * *', label: 'Daily at 8 PM', description: 'Runs every day at 8:00 PM' },
    { value: '0 8 * * 1', label: 'Weekly (Monday 8 AM)', description: 'Runs every Monday at 8:00 AM' },
    { value: 'custom', label: 'Custom Schedule', description: 'Define your own cron expression' },
  ];

  // Update local state when config loads
  useEffect(() => {
    if (config) {
      setIsEnabled(config.is_enabled);
      
      // Find matching preset or set as custom
      const matchingPreset = schedulePresets.find(preset => preset.value === config.schedule);
      if (matchingPreset) {
        setSelectedPreset(matchingPreset.value);
        setCustomSchedule('');
      } else {
        setSelectedPreset('custom');
        setCustomSchedule(config.schedule);
      }
    }
  }, [config]);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value !== 'custom') {
      setCustomSchedule('');
    }
  };

  const handleSave = () => {
    const schedule = selectedPreset === 'custom' ? customSchedule : selectedPreset;
    updateCronJob({ schedule, enabled: isEnabled });
  };

  const getCurrentScheduleDescription = () => {
    if (!config?.is_enabled) return 'Disabled';
    
    const currentPreset = schedulePresets.find(preset => preset.value === config.schedule);
    return currentPreset ? currentPreset.description : `Custom: ${config.schedule}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading configuration...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Non-Billed Resources Sync Scheduling
        </CardTitle>
        <CardDescription>
          Configure automatic synchronization of non-billed resources data. This ensures your non-billed reports stay up-to-date with the latest resource planning information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="sync-enabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <Label htmlFor="sync-enabled" className="text-sm font-medium">
            Enable Automatic Sync
          </Label>
        </div>

        {/* Schedule Selection */}
        {isEnabled && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Sync Schedule</Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a schedule..." />
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
              <div>
                <Label className="text-sm font-medium">Custom Cron Expression</Label>
                <Input
                  value={customSchedule}
                  onChange={(e) => setCustomSchedule(e.target.value)}
                  placeholder="0 8 * * *"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: minute hour day-of-month month day-of-week
                </p>
              </div>
            )}
          </div>
        )}

        {/* Current Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Status</Label>
          <div className="flex items-center gap-2">
            <Badge variant={config?.is_enabled ? "default" : "secondary"}>
              {config?.is_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            {config?.is_enabled && (
              <span className="text-sm text-muted-foreground">
                {getCurrentScheduleDescription()}
              </span>
            )}
          </div>
        </div>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The automatic sync will call the non-billed resources synchronization function to ensure your reports reflect the most current resource planning data. This helps maintain data consistency between resource planning and non-billed tracking.
          </AlertDescription>
        </Alert>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isUpdating || (selectedPreset === 'custom' && !customSchedule.trim())}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving Configuration...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NonBilledSyncScheduling;