import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, RotateCcw, Settings2, Table2, TrendingUp, BarChart3, Maximize2, Minimize2 } from 'lucide-react';
import { NonBilledMetricType } from '@/hooks/use-non-billed-pivot-statistics';

interface NonBilledPivotControlsProps {
  primaryDimension: string;
  secondaryDimension: string;
  onPrimaryDimensionChange: (dimension: string) => void;
  onSecondaryDimensionChange: (dimension: string) => void;
  enableGrouping: boolean;
  onGroupingChange: (enabled: boolean) => void;
  primaryMetric: NonBilledMetricType;
  onPrimaryMetricChange: (metric: NonBilledMetricType) => void;
  displayMode: 'compact' | 'expanded';
  onDisplayModeChange: (mode: 'compact' | 'expanded') => void;
}

const NON_BILLED_DIMENSION_OPTIONS = [
  { value: 'sbu', label: 'SBU', description: 'Strategic Business Unit' },
  { value: 'expertise', label: 'Expertise', description: 'Area of expertise' },
  { value: 'bill_type', label: 'Bill Type', description: 'Non-billed resource classification' },
  { value: 'experience_level', label: 'Experience Level', description: 'Resource experience level' },
];

const METRIC_OPTIONS = [
  { value: 'count', label: 'Count', description: 'Total number of non-billed resources' },
  { value: 'avg_duration', label: 'Avg Duration', description: 'Average days in non-billed status' },
  { value: 'initial_count', label: 'Initial Count', description: 'Resources in initial non-billed state' },
  { value: 'critical_count', label: 'Critical Count', description: 'Resources requiring immediate attention' },
] as const;

export const NonBilledPivotControls: React.FC<NonBilledPivotControlsProps> = ({
  primaryDimension,
  secondaryDimension,
  onPrimaryDimensionChange,
  onSecondaryDimensionChange,
  enableGrouping,
  onGroupingChange,
  primaryMetric,
  onPrimaryMetricChange,
  displayMode,
  onDisplayModeChange,
}) => {
  const handleSwapDimensions = () => {
    onPrimaryDimensionChange(secondaryDimension);
    onSecondaryDimensionChange(primaryDimension);
  };

  const handleReset = () => {
    onPrimaryDimensionChange('sbu');
    onSecondaryDimensionChange('bill_type');
  };

  return (
    <div className="space-y-4">
      {/* Main Controls Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings2 className="w-4 h-4" />
            Analysis Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dimension Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Primary Dimension (Rows)
              </Label>
              <Select value={primaryDimension} onValueChange={onPrimaryDimensionChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NON_BILLED_DIMENSION_OPTIONS.filter(opt => opt.value !== secondaryDimension).map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Table2 className="w-3 h-3" />
                Secondary Dimension (Cols)
              </Label>
              <Select value={secondaryDimension} onValueChange={onSecondaryDimensionChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NON_BILLED_DIMENSION_OPTIONS.filter(opt => opt.value !== primaryDimension).map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwapDimensions}
              className="h-7 px-3 text-xs flex-1"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              Swap Dimensions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-7 px-3 text-xs flex-1"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>

          {/* Grouping Toggle */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Enable Grouping</Label>
              <div className="text-xs text-muted-foreground">Hierarchical organization</div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={enableGrouping} 
                onCheckedChange={onGroupingChange} 
              />
            </div>
          </div>

          {/* Primary Metric Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Primary Metric
            </Label>
            <Select value={primaryMetric} onValueChange={(value) => onPrimaryMetricChange(value as NonBilledMetricType)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display Mode Toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              {displayMode === 'compact' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              Display Mode
            </Label>
            <div className="flex items-center space-x-2">
              <Button
                variant={displayMode === 'compact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDisplayModeChange('compact')}
                className="h-8 text-xs flex-1"
              >
                <Minimize2 className="w-3 h-3 mr-1" />
                Compact
              </Button>
              <Button
                variant={displayMode === 'expanded' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onDisplayModeChange('expanded')}
                className="h-8 text-xs flex-1"
              >
                <Maximize2 className="w-3 h-3 mr-1" />
                Expanded
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <div className="text-xs text-muted-foreground bg-muted/10 p-3 rounded border">
        <span className="font-medium">Preview:</span> Analyzing{' '}
        <span className="font-semibold text-foreground">
          {NON_BILLED_DIMENSION_OPTIONS.find(opt => opt.value === primaryDimension)?.label}
        </span>{' '}
        vs{' '}
        <span className="font-semibold text-foreground">
          {NON_BILLED_DIMENSION_OPTIONS.find(opt => opt.value === secondaryDimension)?.label}
        </span>{' '}
        showing{' '}
        <span className="font-semibold text-primary">
          {METRIC_OPTIONS.find(opt => opt.value === primaryMetric)?.label}
        </span>{' '}
        in {displayMode} mode
        {enableGrouping && <span className="text-primary"> with grouping</span>}
      </div>
    </div>
  );
};