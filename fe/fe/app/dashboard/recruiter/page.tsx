"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useCompanyStatus } from "@/hooks/use-companies";
import { useCompanyApplications } from "@/hooks/use-applications";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  COMPANY_STATUS_LABELS,
  COMPANY_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Building2,
  Briefcase,
  FileText,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data: companyStatus } = useCompanyStatus();
  const { data: applications } = useCompanyApplications();

  const apps = applications || [];
  const pendingApps = apps.filter(
    (a: Record<string, unknown>) => a.status === "PENDING"
  );
  const shortlistedApps = apps.filter(
    (a: Record<string, unknown>) => a.status === "SHORTLISTED"
  );
  const rejectedApps = apps.filter(
    (a: Record<string, unknown>) => a.status === "REJECTED"
  );
  const recentApps = apps.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Manage your company and job postings
        </p>
      </div>

      {companyStatus && (
        <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/30">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Company Status</p>
          </div>
          <StatusBadge
            label={
              COMPANY_STATUS_LABELS[companyStatus.status] || companyStatus.status
            }
            colorClasses={
              COMPANY_STATUS_COLORS[companyStatus.status] || "bg-gray-100 text-gray-800"
            }
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={apps.length}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Review"
          value={pendingApps.length}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Shortlisted"
          value={shortlistedApps.length}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Rejected"
          value={rejectedApps.length}
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {recentApps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Applications</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/recruiter/applications">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            {recentApps.map((app: Record<string, unknown>) => {
              const applicant = app.user as Record<string, unknown> | undefined;
              const job = app.job as Record<string, unknown> | undefined;
              return (
                <div
                  key={app.id as string}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm shrink-0">
                    {((applicant?.name as string) || "?")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {applicant?.name as string || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied for {(job?.title as string) || "Job"}
                    </p>
                  </div>
                  <StatusBadge
                    label={
                      APPLICATION_STATUS_LABELS[app.status as string] ||
                      (app.status as string)
                    }
                    colorClasses={
                      APPLICATION_STATUS_COLORS[app.status as string] ||
                      "bg-gray-100 text-gray-800"
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Button variant="outline" className="h-auto flex-col items-start p-4" asChild>
          <Link href="/dashboard/recruiter/jobs">
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">Manage Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <span className="text-sm text-muted-foreground">
              Create and manage your job postings
            </span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto flex-col items-start p-4" asChild>
          <Link href="/dashboard/recruiter/applications">
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">Review Applications</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <span className="text-sm text-muted-foreground">
              Review and manage candidate applications
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
