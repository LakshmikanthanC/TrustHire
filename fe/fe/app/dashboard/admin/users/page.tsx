"use client";

import { useState } from "react";
import { useAdminUsers } from "@/hooks/use-admin";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { PaginationWrapper } from "@/components/shared/pagination-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { ShieldOff, Mail, Phone } from "lucide-react";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "CANDIDATE", label: "Candidates" },
  { value: "RECRUITER", label: "Recruiters" },
  { value: "ADMIN", label: "Admins" },
];

const ROLE_BADGE_COLORS: Record<string, string> = {
  CANDIDATE: "bg-blue-100 text-blue-800",
  RECRUITER: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800",
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const roleParam = roleFilter === "all" ? undefined : roleFilter;
  const { data, isLoading } = useAdminUsers({
    role: roleParam,
    page,
    limit: 10,
  });

  const handleBlock = async (userId: string) => {
    if (confirm("Are you sure you want to block this user?")) {
      try {
        await api.post(API_ENDPOINTS.admin.blockUser(userId));
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      } catch {
        // error handled
      }
    }
  };

  if (isLoading) return <PageLoader />;

  const users = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            View and manage platform users
          </p>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="No users match the current filters."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {meta.total} user{meta.total !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user: Record<string, unknown>) => (
                <div
                  key={user.id as string}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name as string}</p>
                      <Badge
                        variant="secondary"
                        className={ROLE_BADGE_COLORS[user.role as string] || ""}
                      >
                        {user.role as string}
                      </Badge>
                      {user.isActive === false && (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email as string}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {user.phone as string}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Joined {formatDate(user.createdAt as string)}</span>
                      <span>
                        {(user._count as Record<string, number>)?.applications || 0} applications
                      </span>
                      <span>
                        {((user._count as Record<string, number>)?.sentMessages || 0) +
                          ((user._count as Record<string, number>)?.receivedMessages || 0)} messages
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {user.isActive !== false ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleBlock(user.id as string)}
                      >
                        <ShieldOff className="h-3.5 w-3.5 mr-1" />
                        Block
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
        totalPages={meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
