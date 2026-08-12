"use client";

import { useState, useRef, useEffect } from "react";
import { useMessagesWithUser, useSendMessage } from "@/hooks/use-messages";
import { useAuth } from "@/components/providers/auth-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils";
import Link from "next/link";

interface MessageThreadProps {
  otherUserId: string;
  backHref: string;
  rolePrefix: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
  receiver: User;
}

export function MessageThread({
  otherUserId,
  backHref,
  rolePrefix,
}: MessageThreadProps) {
  const { user } = useAuth();
  const { data: messages, isLoading } = useMessagesWithUser(otherUserId);
  const sendMessage = useSendMessage();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [replying, setReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) return;

    await sendMessage.mutateAsync({
      receiverId: otherUserId,
      subject: subject.trim(),
      content: content.trim(),
    });

    setSubject("");
    setContent("");
    setReplying(false);
  };

  if (isLoading) return <PageLoader />;

  const threadMessages: Message[] = messages || [];
  const otherUser = threadMessages[0]?.sender?.id === user?.id
    ? threadMessages[0]?.receiver
    : threadMessages[0]?.sender;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {otherUser?.name || "Messages"}
          </h1>
          {otherUser && (
            <p className="text-sm text-muted-foreground">{otherUser.email}</p>
          )}
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto p-4 rounded-lg border bg-muted/30">
        {threadMessages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Start a conversation by sending a message below."
          />
        ) : (
          threadMessages.map((msg: Message) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isOwn
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {getInitials(msg.sender?.name || "?")}
                    </div>
                    <span className="text-xs opacity-70">
                      {msg.sender?.name}
                    </span>
                  </div>
                  <p className="text-xs opacity-70 mb-1">{msg.subject}</p>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {replying ? (
        <div className="space-y-3 border rounded-lg p-4">
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={!subject.trim() || !content.trim() || sendMessage.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendMessage.isPending ? "Sending..." : "Send"}
            </Button>
            <Button variant="outline" onClick={() => setReplying(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setReplying(true)}>
          <Send className="h-4 w-4 mr-2" />
          Reply
        </Button>
      )}
    </div>
  );
}
