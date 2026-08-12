"use client";

import { useAdminBlacklist } from "@/hooks/use-admin";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Ban } from "lucide-react";

export default function AdminBlacklistPage() {
  const { data: blacklist, isLoading } = useAdminBlacklist();

  const items = blacklist?.blacklist || blacklist?.data || [];

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blacklist</h1>
        <p className="text-muted-foreground">
          Manage blacklisted companies and entities
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Blacklist is empty"
          description="No companies or entities are currently blacklisted."
          icon={<Ban className="h-8 w-8 text-muted-foreground" />}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {items.length} blacklisted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item: Record<string, unknown>) => (
                <div
                  key={(item.id as string) || Math.random().toString()}
                  className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {(item.companyName as string) ||
                        (item.name as string) ||
                        "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(item.reason as string) || "No reason provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="destructive">Blacklisted</Badge>
                    {item.createdAt ? (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(item.createdAt as string)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
