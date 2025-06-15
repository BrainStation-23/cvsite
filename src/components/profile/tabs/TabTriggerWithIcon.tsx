
import React from 'react';
import { TabsTrigger } from '@/components/ui/tabs';
import { GameNotificationBadge } from '@/components/ui/game-notification-badge';

interface TabTriggerWithIconProps {
  value: string;
  icon: React.ElementType;
  label: string;
  isEmpty: boolean;
  dataTour: string;
}

export const TabTriggerWithIcon: React.FC<TabTriggerWithIconProps> = ({ 
  value, 
  icon: Icon, 
  label, 
  isEmpty, 
  dataTour 
}) => (
  <TabsTrigger 
    value={value} 
    data-tour={dataTour} 
    className="text-xs py-2 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 relative"
  >
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {isEmpty && <GameNotificationBadge />}
    </div>
  </TabsTrigger>
);
