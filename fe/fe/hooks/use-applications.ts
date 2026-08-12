"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/constants";

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (applicationData: {
      jobId: string;
      resume?: string;
      coverLetter?: string;
    }) => {
      const { data } = await api.post(
        API_ENDPOINTS.applications.create,
        applicationData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: ["applications", "me"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.applications.mine);
      return data.data;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}

export function useCompanyApplications() {
  return useQuery({
    queryKey: ["applications", "company"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.applications.company);
      return data.data;
    },
  });
}

export function useJobApplications(jobId: string) {
  return useQuery({
    queryKey: ["applications", "job", jobId],
    queryFn: async () => {
      const { data } = await api.get(
        API_ENDPOINTS.applications.byJob(jobId)
      );
      return data.data;
    },
    enabled: !!jobId,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes?: string;
    }) => {
      const { data } = await api.put(API_ENDPOINTS.applications.updateStatus(id), {
        status,
        notes,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(API_ENDPOINTS.applications.withdraw(id));
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
}

export function useDownloadResume() {
  return {
    download: async (applicationId: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const url = `${API_BASE_URL}${API_ENDPOINTS.applications.resume(applicationId)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download resume");
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition");
      const fileName = disposition?.match(/filename="(.+)"/)?.[1] || "resume";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
    },
  };
}
