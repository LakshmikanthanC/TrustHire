"use client";

import { useParams } from "next/navigation";
import { MessageThread } from "@/components/shared/message-thread";

export default function RecruiterMessageThreadPage() {
  const params = useParams();
  const userId = params.id as string;

  return (
    <MessageThread
      otherUserId={userId}
      backHref="/dashboard/recruiter/messages"
      rolePrefix="recruiter"
    />
  );
}
