"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

export function useConversations() {
  return useQuery({
    queryKey: ["messages", "conversations"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.messages.conversations);
      return data.data;
    },
  });
}

export function useMessagesWithUser(otherUserId: string) {
  return useQuery({
    queryKey: ["messages", "thread", otherUserId],
    queryFn: async () => {
      const { data } = await api.get(
        API_ENDPOINTS.messages.thread(otherUserId)
      );
      return data.data;
    },
    enabled: !!otherUserId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageData: {
      receiverId: string;
      subject: string;
      content: string;
    }) => {
      const { data } = await api.post(
        API_ENDPOINTS.messages.send,
        messageData
      );
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", "thread", variables.receiverId] });
      queryClient.invalidateQueries({ queryKey: ["messages", "conversations"] });
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["messages", "unread"],
    queryFn: async () => {
      const { data } = await api.get(API_ENDPOINTS.messages.unreadCount);
      return data.data;
    },
  });
}
