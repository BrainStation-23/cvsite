import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, RefreshCw, TrendingUp, Users, BarChart3, Target, Trash2 } from 'lucide-react';
import { useWeeklyScoreCard, useCalculateWeeklyScoreCard, useDeleteWeeklyScoreCard } from '@/hooks/use-weekly-score-card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import DatePicker from '@/components/admin/user/DatePicker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const WeeklyScoreCardTab: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScoreCard, setSelectedScoreCard] = useState<{ id: string; timestamp: string } | null>(null);
  const { toast } = useToast();

  const { data: scoreCards, isLoading, error } = useWeeklyScoreCard({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { refetch: calculateNewCard, isFetching: isCalculating } = useCalculateWeeklyScoreCard();
  const deleteScoreCard = useDeleteWeeklyScoreCard();

  const handleCalculateNewCard = async () => {
    try {
      const result = await calculateNewCard();
      const resultData = result.data as any;
      if (resultData?.success) {
        toast({
          title: 'Success',
          description: 'New weekly score card calculated successfully',
        });
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

  const handleDeleteClick = (scoreCard: { id: string; timestamp: string }) => {
    setSelectedScoreCard(scoreCard);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedScoreCard) return;

    try {
      await deleteScoreCard.mutateAsync(selectedScoreCard.id);
      toast({
        title: 'Success',
        description: 'Weekly score card deleted successfully',
      });
      setDeleteDialogOpen(false);
      setSelectedScoreCard(null);
    } catch (error) {
      console.error('Error deleting weekly score card:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete weekly score card',
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
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted/50 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
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
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="flex-1 min-w-48">
              <Label htmlFor="endDate">End Date</Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date"
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

      {/* Modern Weekly Score Cards Grid */}
      {scoreCards && scoreCards.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Weekly Score Cards
            </h2>
            <Badge variant="outline" className="text-sm">
              {scoreCards.length} week{scoreCards.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {scoreCards.map((scoreCard) => {
              const totalBillable = scoreCard.billed_count + scoreCard.non_billed_count;
              const utilizationPercentage = Math.round(scoreCard.utilization_rate * 100);
              const nonBilledTotal = scoreCard.jsonb_record?.non_billed_distribution?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
              const supportTotal = scoreCard.jsonb_record?.support_distribution?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
              const grandTotal = totalBillable + supportTotal;

              return (
                <Card key={scoreCard.id} className="relative overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground">
                          {format(new Date(scoreCard.created_at), 'dd MMM')}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(scoreCard.created_at), 'EEEE, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{grandTotal}</div>
                          <p className="text-xs text-muted-foreground">Total Resources</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick({ id: scoreCard.id, timestamp: scoreCard.created_at })}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete this score card"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Utilization Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Utilization
                        </span>
                        <span className="text-sm font-bold">{utilizationPercentage}%</span>
                      </div>
                      <Progress 
                        value={utilizationPercentage} 
                        className="h-2"
                      />
                    </div>

                    {/* Billable Resources */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-medium text-primary">Billable</span>
                        </div>
                        <span className="text-xl font-bold text-primary">{totalBillable}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 ml-4">
                        <div className="p-2 bg-accent/30 rounded text-center">
                          <div className="text-lg font-semibold text-accent-foreground">{scoreCard.billed_count}</div>
                          <div className="text-xs text-muted-foreground">Billed</div>
                        </div>
                        <div className="p-2 bg-accent/30 rounded text-center">
                          <div className="text-lg font-semibold text-accent-foreground">{scoreCard.non_billed_count}</div>
                          <div className="text-xs text-muted-foreground">Non-Billed</div>
                        </div>
                      </div>
                    </div>

                    {/* Non-Billed Breakdown */}
                    {nonBilledTotal > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-destructive/5 rounded border border-destructive/20">
                          <span className="text-sm font-medium text-destructive">Non-Billed Details</span>
                          <span className="font-semibold text-destructive">{nonBilledTotal}</span>
                        </div>
                        <div className="space-y-1 ml-2">
                          {scoreCard.jsonb_record?.non_billed_distribution?.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-muted-foreground truncate">{item.bill_type_name}</span>
                              <span className="font-medium min-w-fit">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Support Breakdown */}
                    {supportTotal > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-secondary/50 rounded border border-secondary">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-secondary-foreground" />
                            <span className="text-sm font-medium text-secondary-foreground">Support</span>
                          </div>
                          <span className="font-semibold text-secondary-foreground">{supportTotal}</span>
                        </div>
                        <div className="space-y-1 ml-2">
                          {scoreCard.jsonb_record?.support_distribution?.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-muted-foreground truncate">{item.bill_type_name}</span>
                              <span className="font-medium min-w-fit">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No weekly score card data available for the selected period.</p>
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weekly Score Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the weekly score card for{" "}
              {selectedScoreCard && format(new Date(selectedScoreCard.timestamp), 'EEEE, dd MMM yyyy')}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteScoreCard.isPending}
            >
              {deleteScoreCard.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
