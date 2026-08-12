export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    verifyEmail: "/auth/verify-email",
    verifyPhone: "/auth/verify-phone",
    resendOtp: "/auth/resend-otp",
    profile: "/auth/profile",
  },
  companies: {
    register: "/companies/register",
    profile: "/companies/profile",
    status: "/companies/status",
    updateProfile: "/companies/profile",
    uploadDocuments: "/companies/upload-documents",
  },
  jobs: {
    list: "/jobs",
    detail: (id: string) => `/jobs/${id}`,
    create: "/jobs",
    update: (id: string) => `/jobs/${id}`,
    delete: (id: string) => `/jobs/${id}`,
  },
  applications: {
    create: "/applications",
    mine: "/applications/me",
    company: "/applications/company",
    byJob: (jobId: string) => `/applications/job/${jobId}`,
    updateStatus: (id: string) => `/applications/${id}/status`,
    resume: (id: string) => `/applications/${id}/resume`,
    withdraw: (id: string) => `/applications/${id}/withdraw`,
  },
  admin: {
    dashboard: "/admin/dashboard",
    companies: "/admin/companies",
    createCompany: "/admin/companies",
    updateCompany: (id: string) => `/admin/companies/${id}`,
    deleteCompany: (id: string) => `/admin/companies/${id}`,
    createJob: (companyId: string) => `/admin/companies/${companyId}/jobs`,
    updateJob: (id: string) => `/admin/jobs/${id}`,
    deleteJob: (id: string) => `/admin/jobs/${id}`,
    jobs: "/admin/jobs",
    approveCompany: (id: string) => `/admin/approve-company/${id}`,
    rejectCompany: (id: string) => `/admin/reject-company/${id}`,
    blockCompany: (id: string) => `/admin/block-company/${id}`,
    blockUser: (id: string) => `/admin/block-user/${id}`,
    auditLogs: "/admin/audit-logs",
    reports: "/admin/reports",
    blacklist: "/admin/blacklist",
    users: "/admin/users",
  },
  upload: {
    resume: "/upload/resume",
  },
  messages: {
    send: "/messages",
    conversations: "/messages/conversations",
    unreadCount: "/messages/unread-count",
    thread: (userId: string) => `/messages/${userId}`,
  },
} as const;

export const USER_ROLES = {
  CANDIDATE: "CANDIDATE",
  RECRUITER: "RECRUITER",
  ADMIN: "ADMIN",
} as const;

export const USER_ROLE_LABELS: Record<string, string> = {
  CANDIDATE: "Candidate",
  RECRUITER: "Recruiter",
  ADMIN: "Admin",
};

export const COMPANY_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending Review",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  BLOCKED: "Blocked",
};

export const COMPANY_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  BLOCKED: "bg-gray-100 text-gray-800",
};

export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
  FREELANCE: "Freelance",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-purple-100 text-purple-800",
  INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-orange-100 text-orange-800",
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  EMAIL_VERIFIED: "Email Verified",
  PHONE_VERIFIED: "Phone Verified",
  FULLY_VERIFIED: "Fully Verified",
};

export const NAV_LINKS = {
  public: [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Find Jobs" },
  ],
  guest: [
    { href: "/auth/login", label: "Login" },
    { href: "/auth/register", label: "Register" },
  ],
  candidate: [
    { href: "/dashboard/candidate", label: "Dashboard" },
    { href: "/dashboard/candidate/applications", label: "Applications" },
    { href: "/dashboard/candidate/messages", label: "Messages" },
    { href: "/dashboard/candidate/profile", label: "Profile" },
    { href: "/jobs", label: "Find Jobs" },
  ],
  recruiter: [
    { href: "/dashboard/recruiter", label: "Dashboard" },
    { href: "/dashboard/recruiter/company", label: "Company" },
    { href: "/dashboard/recruiter/jobs", label: "Jobs" },
    { href: "/dashboard/recruiter/applications", label: "Applications" },
    { href: "/dashboard/recruiter/messages", label: "Messages" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Dashboard" },
    { href: "/dashboard/admin/companies", label: "Companies" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
    { href: "/dashboard/admin/blacklist", label: "Blacklist" },
    { href: "/dashboard/admin/reports", label: "Reports" },
  ],
};
