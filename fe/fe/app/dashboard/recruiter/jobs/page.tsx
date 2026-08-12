"use client";

import { useState } from "react";
import { useMyJobs, useCreateJob, useDeleteJob } from "@/hooks/use-jobs";
import { PageLoader } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatSalary } from "@/lib/utils";
import { Plus, Trash2, ExternalLink, Users } from "lucide-react";
import Link from "next/link";

export default function RecruiterJobsPage() {
  const { data: myJobs, isLoading } = useMyJobs();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    jobType: "FULL_TIME",
    salaryMin: "",
    salaryMax: "",
    experienceMin: "",
    experienceMax: "",
    skills: "",
  });

  const jobs = myJobs || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob.mutateAsync({
        title: form.title,
        description: form.description,
        location: form.location,
        jobType: form.jobType,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        experienceMin: form.experienceMin ? Number(form.experienceMin) : undefined,
        experienceMax: form.experienceMax ? Number(form.experienceMax) : undefined,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : [],
      });
      setOpen(false);
      setForm({
        title: "",
        description: "",
        location: "",
        jobType: "FULL_TIME",
        salaryMin: "",
        salaryMax: "",
        experienceMin: "",
        experienceMax: "",
        skills: "",
      });
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      await deleteJob.mutateAsync(id);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Job Postings</h1>
          <p className="text-muted-foreground">Manage your job listings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={form.jobType}
                  onValueChange={(v) => setForm({ ...form, jobType: v })}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Salary</Label>
                  <Input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Salary</Label>
                  <Input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Experience (yrs)</Label>
                  <Input
                    type="number"
                    value={form.experienceMin}
                    onChange={(e) => setForm({ ...form, experienceMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Experience (yrs)</Label>
                  <Input
                    type="number"
                    value={form.experienceMax}
                    onChange={(e) => setForm({ ...form, experienceMax: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Input
                  placeholder="React, TypeScript, Node.js"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createJob.isPending}
              >
                {createJob.isPending ? "Creating..." : "Create Job"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs posted yet"
          description="Create your first job posting to start attracting candidates."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Job
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job: Record<string, unknown>) => (
            <Card key={job.id as string}>
              <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{job.title as string}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSalary(job.salaryMin as number, job.salaryMax as number)} ·{(job.location as string) || "Remote"} · Created {formatDate(job.createdAt as string)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/recruiter/applications?jobId=${job.id}`}>
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      Applications
                      {typeof job._count === "object" && job._count !== null && typeof (job._count as Record<string, unknown>).applications === "number" ? (
                        <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                          {(job._count as Record<string, unknown>).applications as number}
                        </span>
                      ) : null}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/jobs/${job.id}`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(job.id as string)}
                    disabled={deleteJob.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
