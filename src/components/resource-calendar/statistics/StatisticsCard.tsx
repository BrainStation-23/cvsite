
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  icon: Icon,
  children,
  className = ""
}) => {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Icon className="h-5 w-5 mr-2 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6 pt-0">
        {children}
      </CardContent>
    </Card>
  );
};
