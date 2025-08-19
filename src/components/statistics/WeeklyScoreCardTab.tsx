
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { useWeeklyScoreCard, useCalculateWeeklyScoreCard } from '@/hooks/use-weekly-score-card';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const WeeklyScoreCardTab: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scoreCards, isLoading, error } = useWeeklyScoreCard({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { refetch: calculateNewCard, isFetching: isCalculating } = useCalculateWeeklyScoreCard();

  const handleCalculateNewCard = async () => {
    try {
      const result = await calculateNewCard();
      if (result.data?.success) {
        toast({
          title: 'Success',
          description: 'New weekly score card calculated successfully',
        });
        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['weekly-score-card'] });
      } else {
        toast({
          title: 'Error',
          description: result.data?.error || 'Failed to calculate weekly score card',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error calculating weekly score card:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate weekly score card',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading weekly score card data: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Weekly Score Card Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-48">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-48">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button 
              onClick={handleCalculateNewCard}
              disabled={isCalculating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
              Calculate New
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Score Cards Display */}
      {scoreCards && scoreCards.length > 0 ? (
        <div className="space-y-4">
          {scoreCards.map((scoreCard) => {
            const totalBillableCount = scoreCard.billed_count + scoreCard.non_billed_count;
            const utilizationPercentage = (scoreCard.utilization_rate * 100).toFixed(1);
            
            return (
              <Card key={scoreCard.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Week of {format(new Date(scoreCard.timestamp), 'MMM dd, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Summary Stats */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Billable Count:</span>
                            <span className="font-semibold">{totalBillableCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Billed Count:</span>
                            <span>{scoreCard.billed_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>• Non-Billed Count:</span>
                            <span>{scoreCard.non_billed_count}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>Utilization Rate:</span>
                            <span className="font-semibold text-green-600">{utilizationPercentage}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Billable Distribution */}
                      {scoreCard.jsonb_record.billable_distribution && scoreCard.jsonb_record.billable_distribution.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-900 mb-2">Billable Distribution</h3>
                          <div className="space-y-1">
                            {scoreCard.jsonb_record.billable_distribution.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.bill_type_name}:</span>
                                <span className="font-medium">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Distribution Breakdowns */}
                    <div className="space-y-4">
                      {/* Non-Billed Distribution */}
                      {scoreCard.jsonb_record.non_billed_distribution && scoreCard.jsonb_record.non_billed_distribution.length > 0 && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-orange-900 mb-2">Non-Billed Breakdown</h3>
                          <div className="space-y-1">
                            {scoreCard.jsonb_record.non_billed_distribution.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.bill_type_name}:</span>
                                <span className="font-medium">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Support Distribution */}
                      {scoreCard.jsonb_record.support_distribution && scoreCard.jsonb_record.support_distribution.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-purple-900 mb-2">Support Breakdown</h3>
                          <div className="space-y-1">
                            {scoreCard.jsonb_record.support_distribution.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.bill_type_name}:</span>
                                <span className="font-medium">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No weekly score card data available for the selected period.</p>
            <Button 
              onClick={handleCalculateNewCard}
              disabled={isCalculating}
              className="mt-4 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
              Calculate First Score Card
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
