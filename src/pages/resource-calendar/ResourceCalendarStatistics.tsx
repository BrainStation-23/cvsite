
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BarChart3 } from 'lucide-react';

const ResourceCalendarStatistics: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link to={baseUrl}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resource Calendar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Resource Calendar Statistics</h1>
            <p className="text-muted-foreground">Analytics and insights for resource planning</p>
          </div>
        </div>

        {/* Placeholder Content */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Statistics Coming Soon</h2>
            <p className="text-muted-foreground text-center max-w-md">
              We're working on bringing you detailed analytics and insights for your resource calendar. 
              Check back soon for comprehensive statistics and reporting features.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarStatistics;
