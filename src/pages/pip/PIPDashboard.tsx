
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const PIPDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <TrendingUp className="h-8 w-8 text-cvsite-teal" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            PIP Dashboard
          </h1>
          <p className="text-muted-foreground">
            Analytics and overview of Performance Improvement Plans
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>PIP statistics and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Placeholder for PIP dashboard analytics
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PIPDashboard;
