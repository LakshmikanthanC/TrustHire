"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useMyApplications } from "@/hooks/use-applications";
import { useJobs } from "@/hooks/use-jobs";
import { StatCard } from "@/components/shared/stat-card";
import { JobCard } from "@/components/shared/job-card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { data: applications } = useMyApplications();
  const { data: jobsData } = useJobs({ limit: 3 });

  const apps = applications || [];
  const jobs = jobsData?.data || jobsData?.jobs || [];

  const totalApps = apps.length;
  const pendingApps = apps.filter(
    (a: Record<string, unknown>) => a.status === "PENDING"
  ).length;
  const shortlistedApps = apps.filter(
    (a: Record<string, unknown>) => a.status === "SHORTLISTED"
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your job search activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={totalApps}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Reviews"
          value={pendingApps}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Shortlisted"
          value={shortlistedApps}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Profile Status"
          value={user?.verificationStatus === "FULLY_VERIFIED" ? "Verified" : "Pending"}
          icon={<Briefcase className="h-5 w-5" />}
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Jobs</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/jobs">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {jobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job: Record<string, unknown>) => (
            <JobCard
              key={job.id as string}
              job={job as React.ComponentProps<typeof JobCard>["job"]}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No jobs available yet.</p>
      )}
    </div>
  );
}
