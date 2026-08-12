"use client";

import { AuthProvider } from "./auth-provider";
import QueryProvider from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
