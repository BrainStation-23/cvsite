
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler } from 'lucide-react';
import { PageMarginsControl } from './spacing/PageMarginsControl';
import { ContentSpacingControl } from './spacing/ContentSpacingControl';

interface SpacingCustomizationProps {
  layoutConfig: Record<string, any>;
  onConfigUpdate: (key: string, value: any) => void;
}

const SpacingCustomization: React.FC<SpacingCustomizationProps> = ({
  layoutConfig,
  onConfigUpdate
}) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Spacing & Layout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <PageMarginsControl 
          layoutConfig={layoutConfig}
          onConfigUpdate={onConfigUpdate}
        />
        
        <ContentSpacingControl 
          layoutConfig={layoutConfig}
          onConfigUpdate={onConfigUpdate}
        />
      </CardContent>
    </Card>
  );
};

export default SpacingCustomization;
