"use client";

import { useState } from "react";
import { useSendMessage } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PenSquare, Send } from "lucide-react";

interface ComposeMessageProps {
  receiverId?: string;
  receiverName?: string;
  trigger?: React.ReactNode;
}

export function ComposeMessage({
  receiverId,
  receiverName,
  trigger,
}: ComposeMessageProps) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(receiverId || "");
  const [toName, setToName] = useState(receiverName || "");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const sendMessage = useSendMessage();

  const handleSend = async () => {
    if (!to || !subject.trim() || !content.trim()) return;

    await sendMessage.mutateAsync({
      receiverId: to,
      subject: subject.trim(),
      content: content.trim(),
    });

    setOpen(false);
    setSubject("");
    setContent("");
    if (!receiverId) {
      setTo("");
      setToName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PenSquare className="h-4 w-4 mr-2" />
            Compose
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            {receiverName ? (
              <Input value={toName} disabled />
            ) : (
              <Input
                placeholder="Enter user ID"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="Message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!to || !subject.trim() || !content.trim() || sendMessage.isPending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {sendMessage.isPending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
