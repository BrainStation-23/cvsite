
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Building, Briefcase, Award, BarChart3 } from 'lucide-react';

interface SummaryStatsProps {
  distributionData: {
    billTypes: Array<{ name: string; value: number }>;
    expertiseTypes: Array<{ name: string; value: number }>;
    projectTypes: Array<{ name: string; value: number }>;
    resourceTypes: Array<{ name: string; value: number }>;
    sbuTypes: Array<{ name: string; value: number }>;
  };
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ distributionData }) => {
  const totalResources = distributionData.resourceTypes.reduce((sum, item) => sum + item.value, 0);
  const totalSBUs = distributionData.sbuTypes.length;
  const totalExpertiseTypes = distributionData.expertiseTypes.length;
  const totalProjectTypes = distributionData.projectTypes.length;
  const totalBillTypes = distributionData.billTypes.length;

  const stats = [
    {
      label: 'Total Resources',
      value: totalResources,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'SBUs',
      value: totalSBUs,
      icon: Building,
      color: 'text-green-600'
    },
    {
      label: 'Expertise Types',
      value: totalExpertiseTypes,
      icon: Award,
      color: 'text-purple-600'
    },
    {
      label: 'Project Types',
      value: totalProjectTypes,
      icon: Briefcase,
      color: 'text-orange-600'
    },
    {
      label: 'Bill Types',
      value: totalBillTypes,
      icon: BarChart3,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
