"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-6xl font-bold text-destructive">!</p>
      <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button className="mt-6" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
