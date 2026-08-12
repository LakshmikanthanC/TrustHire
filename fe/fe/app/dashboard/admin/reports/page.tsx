"use client";

import { useAdminReports } from "@/hooks/use-admin";
import { StatCard } from "@/components/shared/stat-card";
import { PageLoader } from "@/components/shared/loading-spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  Users,
} from "lucide-react";

export default function AdminReportsPage() {
  const { data: reports, isLoading } = useAdminReports();

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Platform analytics and suspicious activity reports
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Suspicious Activities"
          value={reports?.suspiciousCount ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          title="Top Companies"
          value={reports?.topCompanies?.length ?? 0}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          title="Active Users"
          value={reports?.activeUsers ?? 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Growth Rate"
          value={`${reports?.growthRate ?? 0}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {reports?.suspiciousActivities &&
        reports.suspiciousActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Suspicious Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {reports.suspiciousActivities.map(
                  (activity: Record<string, unknown>, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <span>{(activity.description as string) || "Suspicious activity"}</span>
                      <span className="text-xs text-muted-foreground">
                        {activity.severity as string || "medium"}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {reports?.topCompanies && reports.topCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Top Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.topCompanies.map(
                (company: Record<string, unknown>, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <span className="font-medium">
                      {i + 1}. {company.name as string}
                    </span>
                    <span className="text-muted-foreground">
                      {company.jobCount as number || 0} jobs
                    </span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
