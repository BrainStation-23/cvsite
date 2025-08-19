import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      const resultData = result.data as any;
      if (resultData?.success) {
        toast({
          title: 'Success',
          description: 'New weekly score card calculated successfully',
        });
        // Refresh the data
        queryClient.invalidateQueries({ queryKey: ['weekly-score-card'] });
      } else {
        toast({
          title: 'Error',
          description: resultData?.error || 'Failed to calculate weekly score card',
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

      {/* Weekly Score Card Table */}
      {scoreCards && scoreCards.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Weekly ScoreCard</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48"></TableHead>
                  {scoreCards.map((scoreCard) => (
                    <TableHead key={scoreCard.id} className="text-center">
                      <div className="text-blue-600 font-medium">
                        {format(new Date(scoreCard.timestamp), 'dd-MMM-yy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(scoreCard.timestamp), 'EEE')}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Billable Header Row */}
                <TableRow>
                  <TableCell className="font-bold text-lg bg-primary text-primary-foreground">Billable</TableCell>
                  {scoreCards.map((scoreCard) => {
                    const totalBillable = scoreCard.billed_count + scoreCard.non_billed_count;
                    return (
                      <TableCell key={scoreCard.id} className="text-center text-orange-600 font-bold text-xl">
                        {totalBillable}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Billed Breakdown */}
                <TableRow>
                  <TableCell className="pl-8 text-blue-600 font-medium">Billed</TableCell>
                  {scoreCards.map((scoreCard) => (
                    <TableCell key={scoreCard.id} className="text-center font-medium">
                      {scoreCard.billed_count}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Non Billed Breakdown */}
                <TableRow>
                  <TableCell className="pl-8 text-blue-600 font-medium">Non Billed</TableCell>
                  {scoreCards.map((scoreCard) => (
                    <TableCell key={scoreCard.id} className="text-center font-medium">
                      {scoreCard.non_billed_count}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Utilization Rate Header Row */}
                <TableRow>
                  <TableCell className="font-bold text-lg bg-secondary text-secondary-foreground">Utilization Rate</TableCell>
                  {scoreCards.map((scoreCard) => {
                    const utilizationPercentage = (scoreCard.utilization_rate * 100).toFixed(1);
                    return (
                      <TableCell key={scoreCard.id} className="text-center text-orange-600 font-bold text-xl">
                        {utilizationPercentage}%
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Non Billed Breakdown Header */}
                <TableRow>
                  <TableCell className="font-bold text-lg bg-blue-600 text-white">Non Billed Breakdown</TableCell>
                  {scoreCards.map((scoreCard) => {
                    const nonBilledTotal = scoreCard.jsonb_record?.non_billed_distribution?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
                    return (
                      <TableCell key={scoreCard.id} className="text-center text-blue-600 font-bold text-lg">
                        {nonBilledTotal}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Non Billed Distribution Items */}
                {scoreCards[0]?.jsonb_record?.non_billed_distribution?.map((item: any, index: number) => (
                  <TableRow key={`non-billed-${index}`}>
                    <TableCell className="pl-8 text-sm text-gray-600">{item.bill_type_name}</TableCell>
                    {scoreCards.map((scoreCard) => {
                      const matchingItem = scoreCard.jsonb_record?.non_billed_distribution?.find((dist: any) => dist.bill_type_name === item.bill_type_name);
                      return (
                        <TableCell key={scoreCard.id} className="text-center">
                          {matchingItem?.count || '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                {/* Support Breakdown Header */}
                <TableRow>
                  <TableCell className="font-bold text-lg bg-green-600 text-white">Support Breakdown</TableCell>
                  {scoreCards.map((scoreCard) => {
                    const supportTotal = scoreCard.jsonb_record?.support_distribution?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
                    return (
                      <TableCell key={scoreCard.id} className="text-center text-green-600 font-bold text-lg">
                        {supportTotal}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Support Distribution Items */}
                {scoreCards[0]?.jsonb_record?.support_distribution?.map((item: any, index: number) => (
                  <TableRow key={`support-${index}`}>
                    <TableCell className="pl-8 text-sm text-gray-600">{item.bill_type_name}</TableCell>
                    {scoreCards.map((scoreCard) => {
                      const matchingItem = scoreCard.jsonb_record?.support_distribution?.find((dist: any) => dist.bill_type_name === item.bill_type_name);
                      return (
                        <TableCell key={scoreCard.id} className="text-center">
                          {matchingItem?.count || '-'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                {/* Grand Total Header Row */}
                <TableRow className="border-t-2 border-gray-300">
                  <TableCell className="font-bold text-lg bg-gray-800 text-white">Grand Total</TableCell>
                  {scoreCards.map((scoreCard) => {
                    const grandTotal = scoreCard.billed_count + scoreCard.non_billed_count + 
                      (scoreCard.jsonb_record?.support_distribution?.reduce((sum: number, item: any) => sum + item.count, 0) || 0);
                    return (
                      <TableCell key={scoreCard.id} className="text-center text-gray-800 font-bold text-xl">
                        {grandTotal}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
