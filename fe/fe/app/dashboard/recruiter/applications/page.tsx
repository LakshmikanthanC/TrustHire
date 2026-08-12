"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCompanyApplications, useUpdateApplicationStatus, useDownloadResume } from "@/hooks/use-applications";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { PaginationWrapper } from "@/components/shared/pagination-wrapper";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  MessageSquare,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Download,
  StickyNote,
} from "lucide-react";
import Link from "next/link";

export default function RecruiterApplicationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId") || "all";

  const { data: applications, isLoading, error } = useCompanyApplications();
  const updateStatus = useUpdateApplicationStatus();
  const { download: downloadResume } = useDownloadResume();
  const { addToast } = useToast();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState<string>("");
  const limit = 10;

  const allApps = useMemo(() => applications || [], [applications]);

  const uniqueJobs = useMemo(() => {
    const map = new Map<string, string>();
    for (const app of allApps) {
      const job = (app as Record<string, unknown>).job as Record<string, unknown> | undefined;
      if (job?.id && job?.title && !map.has(job.id as string)) {
        map.set(job.id as string, job.title as string);
      }
    }
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [allApps]);

  const filteredApps = useMemo(() => {
    let result = allApps;
    if (jobId !== "all") {
      result = result.filter((a: Record<string, unknown>) => {
        const job = a.job as Record<string, unknown> | undefined;
        return job?.id === jobId;
      });
    }
    if (statusFilter !== "all") {
      result = result.filter((a: Record<string, unknown>) => a.status === statusFilter);
    }
    return result;
  }, [allApps, jobId, statusFilter]);

  const totalPages = Math.ceil(filteredApps.length / limit);
  const paginatedApps = filteredApps.slice((page - 1) * limit, page * limit);

  const statusCounts = useMemo(() => {
    return allApps.reduce((acc: Record<string, number>, a: Record<string, unknown>) => {
      const s = a.status as string;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
  }, [allApps]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      addToast({
        title: "Status Updated",
        description: `Application marked as ${APPLICATION_STATUS_LABELS[status] || status}`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      addToast({
        title: "Update Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === paginatedApps.length) {
        return new Set();
      }
      return new Set(paginatedApps.map((a: Record<string, unknown>) => a.id as string));
    });
  }, [paginatedApps]);

  const handleBulkStatus = async (status: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    let succeeded = 0;
    let failed = 0;
    for (const id of ids) {
      try {
        await updateStatus.mutateAsync({ id, status });
        succeeded++;
      } catch {
        failed++;
      }
    }

    setSelectedIds(new Set());
    addToast({
      title: "Bulk Update Complete",
      description: `${succeeded} application(s) updated to ${APPLICATION_STATUS_LABELS[status] || status}${failed > 0 ? `. ${failed} failed.` : ""}`,
    });
  };

  const handleDownloadResume = async (applicationId: string) => {
    try {
      await downloadResume(applicationId);
      addToast({ title: "Download Started", description: "Resume download has started." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No resume available";
      addToast({ title: "Download Failed", description: message, variant: "destructive" });
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const app = allApps.find((a: Record<string, unknown>) => a.id === id);
      await updateStatus.mutateAsync({ id, status: app?.status as string, notes: notesValue });
      setEditingNotesId(null);
      addToast({ title: "Notes Saved", description: "Application notes updated." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save notes";
      addToast({ title: "Save Failed", description: message, variant: "destructive" });
    }
  };

  const handleJobFilterChange = (value: string) => {
    setPage(1);
    if (value === "all") {
      router.replace("/dashboard/recruiter/applications");
    } else {
      router.replace(`/dashboard/recruiter/applications?jobId=${value}`);
    }
  };

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground">
            Review and manage candidate applications
          </p>
        </div>
        <EmptyState
          title="Unable to load applications"
          description="Make sure you have a company registered and approved. If you just registered, wait for admin approval."
          action={
            <Button asChild>
              <Link href="/dashboard/recruiter/company">View Company</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground">
            Review and manage candidate applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          {uniqueJobs.length > 0 && (
            <Select value={jobId} onValueChange={handleJobFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs ({allApps.length})</SelectItem>
                {uniqueJobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({allApps.length})</SelectItem>
              {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label} ({statusCounts[value] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              {selectedIds.size} application(s) selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatus("SHORTLISTED")}
                disabled={updateStatus.isPending}
              >
                <Star className="h-3.5 w-3.5 mr-1" />
                Shortlist
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
                onClick={() => handleBulkStatus("ACCEPTED")}
                disabled={updateStatus.isPending}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-600 text-red-700 hover:bg-red-50"
                onClick={() => handleBulkStatus("REJECTED")}
                disabled={updateStatus.isPending}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredApps.length === 0 ? (
        <EmptyState
          title={statusFilter === "all" && jobId === "all" ? "No applications yet" : "No matching applications"}
          description={
            statusFilter === "all" && jobId === "all"
              ? "When candidates apply to your jobs, their applications will appear here."
              : "Try selecting different filters."
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {filteredApps.length} application{filteredApps.length !== 1 ? "s" : ""}
              </CardTitle>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={paginatedApps.length > 0 && selectedIds.size === paginatedApps.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 accent-primary"
                />
                Select page
              </label>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedApps.map((app: Record<string, unknown>) => {
                const user = app.user as Record<string, unknown> | undefined;
                const job = app.job as Record<string, unknown> | undefined;
                const skills = (user?.skills as string[]) || [];
                const isSelected = selectedIds.has(app.id as string);

                return (
                  <div
                    key={app.id as string}
                    className={`rounded-lg border p-4 space-y-3 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(app.id as string)}
                            className="h-4 w-4 rounded border-gray-300 accent-primary shrink-0"
                          />
                          <p className="font-semibold text-base">
                            {(user?.name as string) || "Unknown Candidate"}
                          </p>
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
                        <p className="text-sm text-muted-foreground ml-6">
                          Applied for{" "}
                          <span className="font-medium text-foreground">
                            {(job?.title as string) || "Job"}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === "PENDING" || app.status === "REVIEWED" ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleStatusChange(app.id as string, "SHORTLISTED")}
                            disabled={updateStatus.isPending}
                          >
                            <Star className="h-3.5 w-3.5 mr-1" />
                            Select
                          </Button>
                        ) : null}
                        {user?.resume ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadResume(app.id as string)}
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Resume
                          </Button>
                        ) : null}
                        {user?.id ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/recruiter/messages/${user.id}`}>
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />
                              Message
                            </Link>
                          </Button>
                        ) : null}
                        <Select
                          value={app.status as string}
                          onValueChange={(v) =>
                            handleStatusChange(app.id as string, v)
                          }
                        >
                          <SelectTrigger className="w-[170px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(APPLICATION_STATUS_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground ml-6">
                      {typeof user?.email === "string" && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                      )}
                      {typeof user?.phone === "string" && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </span>
                      )}
                      {typeof user?.experience === "number" && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {user.experience} years exp
                        </span>
                      )}
                      {typeof user?.education === "string" && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {user.education}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Applied {formatDate(app.createdAt as string)}
                      </span>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 ml-6">
                        {skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs font-normal">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {app.coverLetter ? (
                      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 rounded p-2 ml-6">
                        <span className="font-medium text-foreground">Cover Letter: </span>
                        {(app.coverLetter as string).slice(0, 200)}
                        {(app.coverLetter as string).length > 200 ? "..." : ""}
                      </p>
                    ) : null}

                    <div className="ml-6 space-y-1">
                      {editingNotesId === app.id ? (
                        <div className="flex items-start gap-2">
                          <textarea
                            className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[40px]"
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            placeholder="Add private notes about this candidate..."
                          />
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleSaveNotes(app.id as string)} disabled={updateStatus.isPending}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingNotesId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          onClick={() => {
                            setEditingNotesId(app.id as string);
                            setNotesValue((app.notes as string) || "");
                          }}
                        >
                          <StickyNote className="h-3 w-3" />
                          {app.notes ? (
                            <span className="truncate max-w-[300px]">{app.notes as string}</span>
                          ) : (
                            <span>Add notes...</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
