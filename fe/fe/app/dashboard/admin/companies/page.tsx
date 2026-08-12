"use client";

import { useState } from "react";
import { useAdminCompanies } from "@/hooks/use-admin";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/loading-spinner";
import { PaginationWrapper } from "@/components/shared/pagination-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";
import {
  COMPANY_STATUS_LABELS,
  COMPANY_STATUS_COLORS,
  JOB_TYPE_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Ban, Plus, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/toast";

const initialCompanyForm = {
  name: "",
  registrationNumber: "",
  gstNumber: "",
  pan: "",
  website: "",
  companyEmail: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  linkedin: "",
};

const initialJobForm = {
  title: "",
  description: "",
  skills: "",
  salaryMin: "",
  salaryMax: "",
  experienceMin: "",
  experienceMax: "",
  location: "",
  jobType: "FULL_TIME",
  vacancies: "1",
};

export default function AdminCompaniesPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [jobForm, setJobForm] = useState(initialJobForm);
  const [addJob, setAddJob] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Record<string, unknown> | null>(null);
  const [editForm, setEditForm] = useState(initialCompanyForm);
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data, isLoading } = useAdminCompanies({
    status: statusFilter || undefined,
    page,
    limit: 50,
  });

  const companies = data?.data || data?.companies || [];
  const total = data?.meta?.total || companies.length;
  const totalPages = Math.ceil(total / 50);

  const handleAction = async (
    action: "approve" | "reject" | "block",
    id: string
  ) => {
    try {
      if (action === "approve") {
        await api.post(API_ENDPOINTS.admin.approveCompany(id));
      } else if (action === "reject") {
        await api.post(API_ENDPOINTS.admin.rejectCompany(id), {
          reason: "Does not meet requirements",
        });
      } else if (action === "block") {
        await api.post(API_ENDPOINTS.admin.blockCompany(id), {
          reason: "Policy violation",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
    } catch {
      // error handled
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove all associated jobs and recruiters.`)) return;
    try {
      await api.delete(API_ENDPOINTS.admin.deleteCompany(id));
      addToast({ title: "Success", description: `"${name}" deleted successfully` });
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete company";
      addToast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const handleEdit = async () => {
    if (!editingCompany) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {};
      if (editForm.name) payload.name = editForm.name;
      if (editForm.website) payload.website = editForm.website;
      if (editForm.companyEmail) payload.companyEmail = editForm.companyEmail;
      if (editForm.address) payload.address = editForm.address;
      if (editForm.city) payload.city = editForm.city;
      if (editForm.state) payload.state = editForm.state;
      if (editForm.pincode) payload.pincode = editForm.pincode;
      if (editForm.gstNumber) payload.gstNumber = editForm.gstNumber;
      if (editForm.pan) payload.pan = editForm.pan;
      if (editForm.linkedin) payload.linkedin = editForm.linkedin;

      await api.put(API_ENDPOINTS.admin.updateCompany(editingCompany.id as string), payload);
      addToast({ title: "Success", description: `"${editForm.name}" updated successfully` });
      setOpenEdit(false);
      setEditingCompany(null);
      setEditForm(initialCompanyForm);
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update company";
      addToast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: companyForm.name,
        registrationNumber: companyForm.registrationNumber,
        website: companyForm.website,
        companyEmail: companyForm.companyEmail,
        address: companyForm.address,
        city: companyForm.city,
        state: companyForm.state,
        pincode: companyForm.pincode,
      };

      if (companyForm.gstNumber) payload.gstNumber = companyForm.gstNumber;
      if (companyForm.pan) payload.pan = companyForm.pan;
      if (companyForm.linkedin) payload.linkedin = companyForm.linkedin;

      if (addJob && jobForm.title && jobForm.description && jobForm.skills) {
        payload.job = {
          title: jobForm.title,
          description: jobForm.description,
          skills: jobForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
          location: jobForm.location || companyForm.city,
          jobType: jobForm.jobType,
          vacancies: parseInt(jobForm.vacancies) || 1,
          ...(jobForm.salaryMin && { salaryMin: parseInt(jobForm.salaryMin) }),
          ...(jobForm.salaryMax && { salaryMax: parseInt(jobForm.salaryMax) }),
          ...(jobForm.experienceMin && { experienceMin: parseInt(jobForm.experienceMin) }),
          ...(jobForm.experienceMax && { experienceMax: parseInt(jobForm.experienceMax) }),
        };
      }

      await api.post(API_ENDPOINTS.admin.createCompany, payload);

      addToast({ title: "Success", description: "Company created successfully" });
      setOpenCreate(false);
      setCompanyForm(initialCompanyForm);
      setJobForm(initialJobForm);
      setAddJob(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create company";
      addToast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Company Verification</h1>
          <p className="text-muted-foreground">
            Review and manage company registrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Company
          </Button>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v === "all" ? "" : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(COMPANY_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          title="No companies found"
          description="No companies match the selected filter."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {total} companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies.map((company: Record<string, unknown>) => (
                <div
                  key={company.id as string}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-medium">{company.name as string}</p>
                    <p className="text-sm text-muted-foreground">
                      {company.companyEmail as string} ·{" "}
                      {(company.city as string) || "No location"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registered {formatDate(company.createdAt as string)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      label={
                        COMPANY_STATUS_LABELS[company.status as string] ||
                        (company.status as string)
                      }
                      colorClasses={
                        COMPANY_STATUS_COLORS[company.status as string] ||
                        "bg-gray-100 text-gray-800"
                      }
                    />
                    {(company.status === "PENDING" ||
                      company.status === "UNDER_REVIEW") && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-600"
                          onClick={() =>
                            handleAction("approve", company.id as string)
                          }
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-600"
                          onClick={() =>
                            handleAction("reject", company.id as string)
                          }
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-orange-600 hover:text-orange-600"
                          onClick={() =>
                            handleAction("block", company.id as string)
                          }
                          title="Block"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-600"
                      onClick={() => {
                        setEditingCompany(company);
                        setEditForm({
                          name: (company.name as string) || "",
                          registrationNumber: (company.registrationNumber as string) || "",
                          gstNumber: (company.gstNumber as string) || "",
                          pan: (company.pan as string) || "",
                          website: (company.website as string) || "",
                          companyEmail: (company.companyEmail as string) || "",
                          address: (company.address as string) || "",
                          city: (company.city as string) || "",
                          state: (company.state as string) || "",
                          pincode: (company.pincode as string) || "",
                          linkedin: (company.linkedin as string) || "",
                        });
                        setOpenEdit(true);
                      }}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-600"
                      onClick={() =>
                        handleDelete(company.id as string, company.name as string)
                      }
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <PaginationWrapper
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  value={companyForm.name}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, name: e.target.value })
                  }
                  placeholder="e.g. TechCorp"
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Number *</Label>
                <Input
                  value={companyForm.registrationNumber}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      registrationNumber: e.target.value,
                    })
                  }
                  placeholder="e.g. TC001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Website *</Label>
                <Input
                  value={companyForm.website}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, website: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Company Email *</Label>
                <Input
                  type="email"
                  value={companyForm.companyEmail}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      companyEmail: e.target.value,
                    })
                  }
                  placeholder="hr@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                value={companyForm.address}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, address: e.target.value })
                }
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={companyForm.city}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, city: e.target.value })
                  }
                  placeholder="Bangalore"
                />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input
                  value={companyForm.state}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, state: e.target.value })
                  }
                  placeholder="Karnataka"
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input
                  value={companyForm.pincode}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, pincode: e.target.value })
                  }
                  placeholder="560001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  value={companyForm.gstNumber}
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      gstNumber: e.target.value,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>PAN</Label>
                <Input
                  value={companyForm.pan}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, pan: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={companyForm.linkedin}
                onChange={(e) =>
                  setCompanyForm({ ...companyForm, linkedin: e.target.value })
                }
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <hr />

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Add Job Posting</p>
              <Button
                type="button"
                variant={addJob ? "destructive" : "outline"}
                size="sm"
                onClick={() => setAddJob(!addJob)}
              >
                {addJob ? "Remove Job" : "+ Add Job"}
              </Button>
            </div>

            {addJob && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={jobForm.title}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, title: e.target.value })
                    }
                    placeholder="e.g. Senior React Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Job Description *</Label>
                  <Textarea
                    value={jobForm.description}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, description: e.target.value })
                    }
                    placeholder="Describe the role, responsibilities..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Skills * (comma separated)</Label>
                  <Input
                    value={jobForm.skills}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, skills: e.target.value })
                    }
                    placeholder="React, TypeScript, Node.js"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Salary</Label>
                    <Input
                      type="number"
                      value={jobForm.salaryMin}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, salaryMin: e.target.value })
                      }
                      placeholder="e.g. 500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Salary</Label>
                    <Input
                      type="number"
                      value={jobForm.salaryMax}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, salaryMax: e.target.value })
                      }
                      placeholder="e.g. 1200000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Experience (years)</Label>
                    <Input
                      type="number"
                      value={jobForm.experienceMin}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          experienceMin: e.target.value,
                        })
                      }
                      placeholder="e.g. 2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Experience (years)</Label>
                    <Input
                      type="number"
                      value={jobForm.experienceMax}
                      onChange={(e) =>
                        setJobForm({
                          ...jobForm,
                          experienceMax: e.target.value,
                        })
                      }
                      placeholder="e.g. 7"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={jobForm.location}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, location: e.target.value })
                      }
                      placeholder="Defaults to company city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <Select
                      value={jobForm.jobType}
                      onValueChange={(v) =>
                        setJobForm({ ...jobForm, jobType: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vacancies</Label>
                    <Input
                      type="number"
                      value={jobForm.vacancies}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, vacancies: e.target.value })
                      }
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenCreate(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. TechCorp"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Email</Label>
                <Input
                  type="email"
                  value={editForm.companyEmail}
                  onChange={(e) => setEditForm({ ...editForm, companyEmail: e.target.value })}
                  placeholder="hr@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  placeholder="Bangalore"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  placeholder="Karnataka"
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={editForm.pincode}
                  onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                  placeholder="560001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input
                  value={editForm.gstNumber}
                  onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>PAN</Label>
                <Input
                  value={editForm.pan}
                  onChange={(e) => setEditForm({ ...editForm, pan: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenEdit(false);
                setEditingCompany(null);
                setEditForm(initialCompanyForm);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
