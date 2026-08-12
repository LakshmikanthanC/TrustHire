"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

export function useJobs(params?: {
  search?: string;
  location?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set("search", params.search);
      if (params?.location) searchParams.set("location", params.location);
      if (params?.jobType) searchParams.set("jobType", params.jobType);
      if (params?.salaryMin) searchParams.set("salaryMin", String(params.salaryMin));
      if (params?.salaryMax) searchParams.set("salaryMax", String(params.salaryMax));
      if (params?.skills?.length) searchParams.set("skills", params.skills.join(","));
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));

      const { data } = await api.get(
        `${API_ENDPOINTS.jobs.list}?${searchParams.toString()}`
      );
      return data.data;
    },
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.jobs.detail(id));
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobData: Record<string, unknown>) => {
      const { data } = await api.post(API_ENDPOINTS.jobs.create, jobData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...jobData }: Record<string, unknown> & { id: string }) => {
      const { data } = await api.put(API_ENDPOINTS.jobs.update(id), jobData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", variables.id] });
    },
  });
}

export function useMyJobs() {
  return useQuery({
    queryKey: ["jobs", "my"],
    queryFn: async () => {
      const { data } = await api.get("/jobs/my");
      return data.data;
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(API_ENDPOINTS.jobs.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
