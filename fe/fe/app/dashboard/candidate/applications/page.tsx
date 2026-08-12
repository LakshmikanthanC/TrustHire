"use client";

import { useState } from "react";
import { useMyApplications, useWithdrawApplication } from "@/hooks/use-applications";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaginationWrapper } from "@/components/shared/pagination-wrapper";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageSquare, XCircle } from "lucide-react";

export default function CandidateApplicationsPage() {
  const { data: applications, isLoading } = useMyApplications();
  const withdrawApp = useWithdrawApplication();
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const limit = 10;

  const handleWithdraw = async (id: string) => {
    try {
      await withdrawApp.mutateAsync(id);
      addToast({ title: "Application Withdrawn", description: "Your application has been withdrawn." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to withdraw application";
      addToast({ title: "Withdraw Failed", description: message, variant: "destructive" });
    }
  };

  const apps = applications || [];
  const totalPages = Math.ceil(apps.length / limit);
  const paginatedApps = apps.slice((page - 1) * limit, page * limit);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      {paginatedApps.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Start applying to jobs to see them here."
          action={
            <Button asChild>
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {apps.length} application{apps.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paginatedApps.map((app: Record<string, unknown>) => (
                <div
                  key={app.id as string}
                  className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium truncate">
                      {(app.job as Record<string, unknown>)?.title as string || "Job"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Applied {formatDate(app.createdAt as string)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      label={APPLICATION_STATUS_LABELS[app.status as string] || (app.status as string)}
                      colorClasses={
                        APPLICATION_STATUS_COLORS[app.status as string] || "bg-gray-100 text-gray-800"
                      }
                    />
                    {(app.status === "PENDING" || app.status === "REVIEWED") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleWithdraw(app.id as string)}
                        disabled={withdrawApp.isPending}
                        title="Withdraw application"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {(() => {
                      const job = app.job as Record<string, unknown>;
                      const company = job?.company as Record<string, unknown>;
                      const recruiters = company?.recruiters as Array<Record<string, unknown>> | undefined;
                      const recruiterUserId = recruiters?.[0]?.userId;
                      return recruiterUserId ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/dashboard/candidate/messages/${recruiterUserId}`}>
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      ) : null;
                    })()}
                    {(app.job as Record<string, unknown>)?.id ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/jobs/${(app.job as Record<string, unknown>).id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <PaginationWrapper
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
