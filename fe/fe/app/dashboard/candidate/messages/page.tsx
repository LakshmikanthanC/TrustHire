"use client";

import { useState } from "react";
import { useConversations } from "@/hooks/use-messages";
import { ComposeMessage } from "@/components/shared/compose-message";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";
import { formatDateTime, getInitials, truncate } from "@/lib/utils";
import Link from "next/link";

export default function CandidateMessagesPage() {
  const { data: conversations, isLoading } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) return <PageLoader />;

  const convos = (conversations || []).filter(
    (conv: Record<string, unknown>) => {
      const otherUser = conv.otherUser as Record<string, unknown>;
      const name = (otherUser?.name as string) || "";
      const email = (otherUser?.email as string) || "";
      const query = searchQuery.toLowerCase();
      return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with recruiters
          </p>
        </div>
        <ComposeMessage />
      </div>

      <input
        type="text"
        placeholder="Search conversations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border rounded-md bg-background text-sm"
      />

      {convos.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="When recruiters message you, they will appear here."
          icon={<MessageSquare className="h-12 w-12" />}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {convos.length} conversation{convos.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {convos.map((conv: Record<string, unknown>) => {
                const otherUser = conv.otherUser as Record<string, unknown>;
                const lastMessage = conv.lastMessage as Record<string, unknown>;
                const unreadCount = conv.unreadCount as number;

                return (
                  <Link
                    key={otherUser?.id as string}
                    href={`/dashboard/candidate/messages/${otherUser?.id}`}
                    className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                      {getInitials((otherUser?.name as string) || "?")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">
                          {otherUser?.name as string}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {lastMessage?.createdAt
                            ? formatDateTime(lastMessage.createdAt as string)
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {otherUser?.email as string}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          <span className="font-medium text-foreground">
                            {lastMessage?.subject as string}:
                          </span>{" "}
                          {truncate(lastMessage?.content as string || "", 50)}
                        </p>
                        {unreadCount > 0 && (
                          <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
