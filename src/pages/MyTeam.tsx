import DashboardLayout from '@/components/Layout/DashboardLayout';
import OrgChart from '@/components/org-chart/OrgChart';

export default function MyTeam() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
          <p className="text-muted-foreground">
            View your organizational relationships and team structure
          </p>
        </div>
        
        <OrgChart className="w-full" />
      </div>
    </DashboardLayout>
  );
}
