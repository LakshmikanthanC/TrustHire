"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { PageLoader } from "@/components/shared/loading-spinner";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const role = user.role?.toLowerCase();
      const pathRole = pathname.split("/")[2];
      if (pathRole && pathRole !== role && role !== "admin") {
        router.push(`/dashboard/${role}`);
      }
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const roleLinks: Record<string, string[]> = {
    candidate: ["/dashboard/candidate"],
    recruiter: ["/dashboard/recruiter"],
    admin: ["/dashboard/admin"],
  };

  const role = user?.role?.toLowerCase() || "";
  const allowedPrefixes = roleLinks[role] || [];

  const isAuthorized =
    role === "admin" || allowedPrefixes.some((p) => pathname.startsWith(p));

  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
