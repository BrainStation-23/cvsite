import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { ViewToggle } from './ViewToggle';
interface ResourceStatisticsHeaderProps {
  baseUrl: string;
  groupingDescription: string;
  activeTab: string;
  showCharts: boolean;
  showTables: boolean;
  onToggleCharts: () => void;
  onToggleTables: () => void;
}
export const ResourceStatisticsHeader: React.FC<ResourceStatisticsHeaderProps> = ({
  baseUrl,
  groupingDescription,
  activeTab,
  showCharts,
  showTables,
  onToggleCharts,
  onToggleTables
}) => {
  return <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to={baseUrl}>
          
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Resource Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            {groupingDescription}
          </p>
        </div>
      </div>
      
      {/* View Toggle - Only show for overview tab */}
      {activeTab === 'overview' && <ViewToggle showCharts={showCharts} showTables={showTables} onToggleCharts={onToggleCharts} onToggleTables={onToggleTables} />}
    </div>;
};