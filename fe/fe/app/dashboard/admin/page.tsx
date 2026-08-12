"use client";

import { useAdminDashboard } from "@/hooks/use-admin";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageLoader } from "@/components/shared/loading-spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  BarChart3,
} from "lucide-react";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS, JOB_TYPE_LABELS } from "@/lib/constants";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminDashboard();

  if (isLoading) return <PageLoader />;

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Companies",
      value: stats?.totalCompanies ?? 0,
      description: `${stats?.approvedCompanies ?? 0} approved`,
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: "Active Jobs",
      value: stats?.totalJobs ?? 0,
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: "Applications",
      value: stats?.totalApplications ?? 0,
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const alertCards = [
    {
      title: "Pending Review",
      value: stats?.pendingCompanies ?? 0,
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      color: "text-yellow-600",
    },
    {
      title: "Rejected",
      value: stats?.rejectedCompanies ?? 0,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      color: "text-red-600",
    },
    {
      title: "Blocked",
      value: stats?.blockedCompanies ?? 0,
      icon: <Ban className="h-4 w-4 text-gray-500" />,
      color: "text-gray-600",
    },
    {
      title: "Reported Users",
      value: stats?.reportedUsers ?? 0,
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      color: "text-orange-600",
    },
  ];

  const JOB_TYPE_COLORS: Record<string, string> = {
    FULL_TIME: "bg-blue-100 text-blue-800",
    PART_TIME: "bg-purple-100 text-purple-800",
    CONTRACT: "bg-orange-100 text-orange-800",
    INTERNSHIP: "bg-green-100 text-green-800",
    REMOTE: "bg-cyan-100 text-cyan-800",
    FREELANCE: "bg-pink-100 text-pink-800",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of the TrustHire platform
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {alertCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {card.icon}
                <div>
                  <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentActivity.map(
                  (activity: Record<string, unknown>, i: number) => (
                    <div
                      key={(activity.id as string) || i}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <span className="truncate pr-4">
                        {activity.description as string}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {activity.timestamp
                          ? new Date(activity.timestamp as string).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {stats?.topCompanies && stats.topCompanies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Top Companies by Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topCompanies.map((company: Record<string, unknown>) => (
                  <div
                    key={company.id as string}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{company.name as string}</p>
                      <p className="text-xs text-muted-foreground">{company.city as string}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge
                        label={
                          company.status === "APPROVED"
                            ? "Approved"
                            : (company.status as string)
                        }
                        colorClasses={
                          company.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {(company._count as Record<string, number>)?.jobs ?? 0} jobs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {stats?.jobsByType && stats.jobsByType.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                Jobs by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.jobsByType.map((item: Record<string, unknown>) => {
                  const total = stats.totalJobs || 1;
                  const pct = Math.round(((item.count as number) / total) * 100);
                  return (
                    <div key={item.type as string} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {JOB_TYPE_LABELS[item.type as keyof typeof JOB_TYPE_LABELS] || (item.type as string)}
                        </span>
                        <span className="text-muted-foreground">
                          {item.count as number} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-2 rounded-full ${JOB_TYPE_COLORS[item.type as string] || "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {stats?.recentApplications && stats.recentApplications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Recent Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentApplications.map((app: Record<string, unknown>) => (
                  <div
                    key={app.id as string}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {app.candidate as string} → {app.job as string}
                      </p>
                      <p className="text-xs text-muted-foreground">{app.company as string}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge
                        label={
                          APPLICATION_STATUS_LABELS[app.status as keyof typeof APPLICATION_STATUS_LABELS] ||
                          (app.status as string)
                        }
                        colorClasses={
                          APPLICATION_STATUS_COLORS[app.status as keyof typeof APPLICATION_STATUS_COLORS] ||
                          "bg-gray-100 text-gray-800"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
