
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CalendarDays, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ResourceCalendar: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin' : '/manager';

  const menuItems = [
    {
      title: 'Planning',
      description: 'Manage and plan resource allocations across projects',
      icon: Calendar,
      href: `${baseUrl}/resource-calendar/planning`,
      color: 'text-purple-600'
    },
    {
      title: 'Calendar View',
      description: 'View and manage resource allocations across projects and time periods',
      icon: CalendarDays,
      href: `${baseUrl}/resource-calendar/calendar`,
      color: 'text-blue-600'
    },
    {
      title: 'Statistics',
      description: 'Analyze resource utilization patterns and generate reports',
      icon: BarChart3,
      href: `${baseUrl}/resource-calendar/statistics`,
      color: 'text-green-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage resource planning and view analytics
          </p>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={cn("p-3 rounded-lg bg-gray-50", item.color)}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendar;
