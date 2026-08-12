"use client";

import { useParams } from "next/navigation";
import { MessageThread } from "@/components/shared/message-thread";

export default function CandidateMessageThreadPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <MessageThread
      otherUserId={userId}
      backHref="/dashboard/candidate/messages"
      rolePrefix="candidate"
    />
  );
}
