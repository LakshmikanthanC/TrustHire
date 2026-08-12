"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

export function useRegisterCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyData: Record<string, unknown>) => {
      const { data } = await api.post(
        API_ENDPOINTS.companies.register,
        companyData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}

export function useCompanyProfile() {
  return useQuery({
    queryKey: ["company", "profile"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.companies.profile);
      return data.data;
    },
  });
}

export function useCompanyStatus() {
  return useQuery({
    queryKey: ["company", "status"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.companies.status);
      return data.data;
    },
  });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyData: Record<string, unknown>) => {
      const { data } = await api.put(
        API_ENDPOINTS.companies.updateProfile,
        companyData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}

export function useUploadCompanyDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const { data } = await api.post(
        API_ENDPOINTS.companies.uploadDocuments,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
}
