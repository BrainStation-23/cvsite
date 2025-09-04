
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ResourceCalendarFilters } from '../../components/calendar/ResourceCalendarFilters';
import { CalendarHeader } from '../../components/calendar/CalendarHeader';
import { ResourceGanttChart } from '../../components/calendar/gantt/ResourceGanttChart';
import { EngagementModal } from '../../components/calendar/timeline-view/EngagementModal';
import { useResourceCalendarData } from '../../hooks/use-resource-calendar-data';
import { useResourcePlanningOperations } from '../../hooks/use-resource-planning-operations';
import { startOfMonth, addMonths, subMonths } from 'date-fns';
import { GanttEngagement } from '../../components/calendar/gantt/types';
import { useToast } from '@/hooks/use-toast';

interface AdvancedFilters {
  billTypeFilter: string | null;
  projectSearch: string;
  minEngagementPercentage: number | null;
  maxEngagementPercentage: number | null;
  minBillingPercentage: number | null;
  maxBillingPercentage: number | null;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
  projectLevelFilter: string | null;
  projectBillTypeFilter: string | null;
}

const ResourceCalendarView: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('/admin/');
  const baseUrl = isAdmin ? '/admin/resource-calendar' : '/manager/resource-calendar';

  // Month navigation state
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  // Basic filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSbu, setSelectedSbu] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [showUnplanned, setShowUnplanned] = useState(false);

  // Advanced filter states
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    billTypeFilter: null,
    projectSearch: '',
    minEngagementPercentage: null,
    maxEngagementPercentage: null,
    minBillingPercentage: null,
    maxBillingPercentage: null,
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: '',
    projectLevelFilter: null,
    projectBillTypeFilter: null,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEngagement, setSelectedEngagement] = useState<any>(null);
  const [preselectedResourceId, setPreselectedResourceId] = useState<string | null>(null);
  const [preselectedStartDate, setPreselectedStartDate] = useState<Date | null>(null);

  const { toast } = useToast();
  const { createResourcePlanning, updateResourcePlanning } = useResourcePlanningOperations();

  // Fetch resource data
  const { data: resourceData, isLoading, error } = useResourceCalendarData(
    searchQuery,
    selectedSbu,
    selectedManager,
    currentMonth,
    advancedFilters
  );

  // Month navigation handlers
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(startOfMonth(new Date()));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSbu(null);
    setSelectedManager(null);
    setShowUnplanned(false);
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      billTypeFilter: null,
      projectSearch: '',
      minEngagementPercentage: null,
      maxEngagementPercentage: null,
      minBillingPercentage: null,
      maxBillingPercentage: null,
      startDateFrom: '',
      startDateTo: '',
      endDateFrom: '',
      endDateTo: '',
      projectLevelFilter: null,
      projectBillTypeFilter: null,
    });
  };

  // Modal handlers
  const handleEngagementClick = (engagement: GanttEngagement) => {
    // Find the original ResourceCalendarData for this engagement
    const originalData = resourceData?.find(item => 
      item.id === engagement.id
    );
    setSelectedEngagement(originalData || null);
    setModalMode('edit');
    setPreselectedResourceId(null);
    setPreselectedStartDate(null);
    setIsModalOpen(true);
  };

  const handleEmptySpaceClick = (resourceId: string, clickDate: Date) => {
    setPreselectedResourceId(resourceId);
    setPreselectedStartDate(clickDate);
    setModalMode('create');
    setSelectedEngagement(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEngagement(null);
    setPreselectedResourceId(null);
    setPreselectedStartDate(null);
  };

  const handleModalSave = async (data: any) => {
    try {
      if (modalMode === 'create') {
        createResourcePlanning({
          profile_id: data.profile_id,
          bill_type_id: data.bill_type_id,
          forecasted_project: data.forecasted_project,
          engagement_start_date: data.engagement_start_date,
          release_date: data.release_date,
          engagement_percentage: data.engagement_percentage,
          billing_percentage: data.billing_percentage || 0,
        });
        toast({
          title: "Success",
          description: "Forecasted engagement created successfully",
        });
      } else if (modalMode === 'edit' && selectedEngagement) {
        updateResourcePlanning({
          id: selectedEngagement.id,
          updates: {
            profile_id: data.profile_id,
            bill_type_id: data.bill_type_id,
            forecasted_project: data.forecasted_project,
            engagement_start_date: data.engagement_start_date,
            release_date: data.release_date,
            engagement_percentage: data.engagement_percentage,
            billing_percentage: data.billing_percentage || 0,
          }
        });
      }
      handleModalClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save engagement",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={baseUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Resource Calendar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar View</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage resource allocations across projects and time periods
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <ResourceCalendarFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSbu={selectedSbu}
          onSbuChange={setSelectedSbu}
          selectedManager={selectedManager}
          onManagerChange={setSelectedManager}
          showUnplanned={showUnplanned}
          onShowUnplannedChange={setShowUnplanned}
          onClearFilters={clearFilters}
          advancedFilters={advancedFilters}
          onAdvancedFiltersChange={setAdvancedFilters}
          onClearAdvancedFilters={clearAdvancedFilters}
        />

        {/* Calendar Header */}
        <CalendarHeader
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        {/* Gantt Chart */}
        <div className="bg-background rounded-lg border">
          {error ? (
            <div className="p-6 text-center text-destructive">
              <p>Error loading resource data: {error.message}</p>
            </div>
          ) : (
            <ResourceGanttChart
              resourceData={resourceData}
              currentMonth={currentMonth}
              isLoading={isLoading}
              onEngagementClick={handleEngagementClick}
              onEmptySpaceClick={handleEmptySpaceClick}
            />
          )}
        </div>

        {/* Engagement Modal */}
        <EngagementModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          mode={modalMode}
          initialData={selectedEngagement}
          preselectedResourceId={preselectedResourceId || undefined}
          preselectedStartDate={preselectedStartDate || undefined}
        />
      </div>
    </DashboardLayout>
  );
};

export default ResourceCalendarView;
