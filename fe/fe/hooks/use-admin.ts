"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.admin.dashboard);
      return data.data;
    },
  });
}

export function useAdminCompanies(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin", "companies", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set("status", params.status);
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      const { data } = await api.get(
        `${API_ENDPOINTS.admin.companies}?${searchParams.toString()}`
      );
      return data.data;
    },
  });
}

export function useAdminAuditLogs(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      const { data } = await api.get(
        `${API_ENDPOINTS.admin.auditLogs}?${searchParams.toString()}`
      );
      return data.data;
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.admin.reports);
      return data.data;
    },
  });
}

export function useAdminBlacklist() {
  return useQuery({
    queryKey: ["admin", "blacklist"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.admin.blacklist);
      return data.data;
    },
  });
}

export function useAdminUsers(params?: {
  role?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.role) searchParams.set("role", params.role);
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      const { data } = await api.get(
        `${API_ENDPOINTS.admin.users}?${searchParams.toString()}`
      );
      return data.data;
    },
  });
}
