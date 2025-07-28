
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface DistributionData {
  name: string;
  value: number;
}

interface DistributionChartProps {
  data: DistributionData[];
  loading?: boolean;
  emptyMessage?: string;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  data,
  loading = false,
  emptyMessage = "No data available"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAll, setShowAll] = useState(false);
  
  const displayLimit = 10;

  // Filter and sort data
  const filteredData = data
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const compareValue = sortBy === 'name' 
        ? a.name.localeCompare(b.name)
        : a.value - b.value;
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  const displayData = showAll ? filteredData : filteredData.slice(0, displayLimit);
  const hasMore = filteredData.length > displayLimit;
  const maxValue = Math.max(...filteredData.map(d => d.value), 1);
  const total = filteredData.reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2 mb-4">
          <div className="h-9 bg-muted rounded-md flex-1 animate-pulse" />
          <div className="h-9 bg-muted rounded-md w-32 animate-pulse" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-4 bg-muted rounded w-8 animate-pulse" />
            </div>
            <div className="w-full bg-muted rounded-full h-2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [newSortBy, newSortOrder] = value.split('-') as ['name' | 'value', 'asc' | 'desc'];
          setSortBy(newSortBy);
          setSortOrder(newSortOrder);
        }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="value-desc">Count (High to Low)</SelectItem>
            <SelectItem value="value-asc">Count (Low to High)</SelectItem>
            <SelectItem value="name-asc">Name (A to Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z to A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results info */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {data.length} categories
        </p>
      )}

      {/* Chart */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          const barWidth = (item.value / maxValue) * 100;
          
          return (
            <div key={`${item.name}-${index}`} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium truncate flex-1 mr-2" title={item.name}>
                  {item.name}
                </span>
                <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                  <span className="font-bold text-foreground">{item.value}</span>
                  <span className="text-xs">({percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more/less button */}
      {hasMore && !searchQuery && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show All ({data.length - displayLimit} more)
            </>
          )}
        </Button>
      )}
    </div>
  );
};
