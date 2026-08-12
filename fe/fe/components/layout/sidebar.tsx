"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  Users,
  Shield,
  Ban,
  BarChart3,
  User,
  MessageSquare,
} from "lucide-react";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  "/dashboard/admin": <Shield className="h-4 w-4" />,
  "/dashboard/admin/companies": <Building2 className="h-4 w-4" />,
  "/dashboard/admin/users": <Users className="h-4 w-4" />,
  "/dashboard/admin/audit-logs": <FileText className="h-4 w-4" />,
  "/dashboard/admin/blacklist": <Ban className="h-4 w-4" />,
  "/dashboard/admin/reports": <BarChart3 className="h-4 w-4" />,
  "/dashboard/recruiter": <LayoutDashboard className="h-4 w-4" />,
  "/dashboard/recruiter/company": <Building2 className="h-4 w-4" />,
  "/dashboard/recruiter/jobs": <Briefcase className="h-4 w-4" />,
  "/dashboard/recruiter/applications": <FileText className="h-4 w-4" />,
  "/dashboard/recruiter/messages": <MessageSquare className="h-4 w-4" />,
  "/dashboard/candidate": <LayoutDashboard className="h-4 w-4" />,
  "/dashboard/candidate/applications": <FileText className="h-4 w-4" />,
  "/dashboard/candidate/messages": <MessageSquare className="h-4 w-4" />,
  "/dashboard/candidate/profile": <User className="h-4 w-4" />,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const getLinks = () => {
    switch (user?.role) {
      case "ADMIN":
        return NAV_LINKS.admin;
      case "RECRUITER":
        return NAV_LINKS.recruiter;
      default:
        return NAV_LINKS.candidate;
    }
  };

  const links = getLinks();

  return (
    <aside
      className={cn(
        "hidden lg:flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <nav className="flex flex-col gap-1 px-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "justify-start gap-2 px-3 h-9 text-sm font-normal",
                  isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
                )}
                asChild
              >
                <Link href={link.href}>
                  {ROLE_ICONS[link.href] || <LayoutDashboard className="h-4 w-4" />}
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
