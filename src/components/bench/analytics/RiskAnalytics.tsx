import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  Building,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface RiskProfile {
  profile_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  sbu_name: string;
  expertise_name: string;
  bill_type_name: string;
  color_code: string;
  bench_date: string;
  bench_duration_days: number;
  total_years_experience: number;
  bench_feedback: string;
  planned_status: string;
}

interface RiskSummary {
  total_high_risk_count: number;
  critical_risk_count: number;
  unplanned_high_risk_count: number;
  avg_high_risk_duration: number;
  senior_high_risk_count: number;
}

interface TopRiskSbu {
  sbu_name: string;
  risk_count: number;
  avg_duration: number;
}

interface RiskAnalyticsProps {
  data?: {
    risk_summary: RiskSummary;
    high_risk_profiles: RiskProfile[];
    top_risk_sbus: TopRiskSbu[];
  } | null;
  isLoading: boolean;
}

export function RiskAnalytics({ data, isLoading }: RiskAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle no data or empty risk data
  if (!data || !data.risk_summary || data.risk_summary.total_high_risk_count === 0) {
    return (
      <div className="space-y-6">
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">All Clear!</h3>
                <p className="text-muted-foreground mt-1">
                  No employees are currently at risk. All bench profiles are within acceptable duration limits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Show zero state metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                High Risk Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">30+ days on bench</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Critical Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={0} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground">0%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Unplanned Bench
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={0} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground">0%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { risk_summary, high_risk_profiles, top_risk_sbus } = data;

  const getRiskLevel = (days: number) => {
    if (days >= 90) return { level: 'Critical', variant: 'destructive' as const, color: 'text-destructive' };
    if (days >= 60) return { level: 'High', variant: 'destructive' as const, color: 'text-destructive' };
    if (days >= 30) return { level: 'Medium', variant: 'secondary' as const, color: 'text-orange-600' };
    return { level: 'Low', variant: 'default' as const, color: 'text-muted-foreground' };
  };

  const criticalPercentage = risk_summary.total_high_risk_count > 0 
    ? (risk_summary.critical_risk_count / risk_summary.total_high_risk_count) * 100 
    : 0;

  const unplannedPercentage = risk_summary.total_high_risk_count > 0 
    ? (risk_summary.unplanned_high_risk_count / risk_summary.total_high_risk_count) * 100 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Risk Summary Alert */}
      {risk_summary.critical_risk_count > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{risk_summary.critical_risk_count} critical risk profiles</strong> have been on bench for over 90 days. 
            Immediate action required.
          </AlertDescription>
        </Alert>
      )}

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              High Risk Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{risk_summary.total_high_risk_count}</div>
            <p className="text-xs text-muted-foreground">30+ days on bench</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{risk_summary.critical_risk_count}</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={criticalPercentage} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">{criticalPercentage.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Unplanned Bench
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{risk_summary.unplanned_high_risk_count}</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={unplannedPercentage} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">{unplannedPercentage.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{risk_summary.avg_high_risk_duration}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risk SBUs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              Top Risk SBUs
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              SBUs with highest bench risk counts
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {top_risk_sbus.slice(0, 5).map((sbu, index) => (
                <div key={sbu.sbu_name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{sbu.sbu_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg: {sbu.avg_duration} days
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {sbu.risk_count} profiles
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* High Risk Profiles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Critical Profiles
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Profiles requiring immediate attention
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {high_risk_profiles.slice(0, 10).map((profile) => {
                const risk = getRiskLevel(profile.bench_duration_days);
                return (
                  <div key={profile.profile_id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile.employee_id} • {profile.sbu_name}
                        </p>
                      </div>
                      <Badge variant={risk.variant} className="ml-2">
                        {profile.bench_duration_days} days
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" style={{ borderColor: profile.color_code }}>
                        {profile.bill_type_name}
                      </Badge>
                      <span className="text-muted-foreground">•</span>
                      <span>{profile.expertise_name}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className={profile.planned_status === 'planned' ? 'text-green-600' : 'text-orange-600'}>
                        {profile.planned_status}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Bench since: {format(new Date(profile.bench_date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}