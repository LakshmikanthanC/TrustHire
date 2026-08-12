"use client";

import { useState } from "react";
import { useAdminAuditLogs } from "@/hooks/use-admin";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { PaginationWrapper } from "@/components/shared/pagination-wrapper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminAuditLogs({ page, limit: 20 });

  const logs = data?.data || data?.logs || [];
  const total = data?.meta?.total || logs.length;
  const totalPages = Math.ceil(total / 20);

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    LOGIN: "bg-purple-100 text-purple-800",
    APPROVE: "bg-green-100 text-green-800",
    REJECT: "bg-red-100 text-red-800",
    BLOCK: "bg-orange-100 text-orange-800",
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track all platform activities and changes
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title="No audit logs"
          description="Audit logs will appear here as activities occur."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {total} log entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.map((log: Record<string, unknown>) => (
                <div
                  key={(log.id as string) || Math.random().toString()}
                  className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {(log.description as string) ||
                        (log.action as string) ||
                        "Activity"}
                    </p>
                    {log.user ? (
                      <p className="text-xs text-muted-foreground">
                        by {(log.user as Record<string, unknown>)?.name as string || "System"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {log.action ? (
                      <Badge
                        className={
                          actionColors[log.action as string] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {log.action as string}
                      </Badge>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.createdAt as string)}
                    </span>
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
