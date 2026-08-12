"use client";

import { useParams, useRouter } from "next/navigation";
import { useJob } from "@/hooks/use-jobs";
import { useCreateApplication } from "@/hooks/use-applications";
import { useAuth } from "@/components/providers/auth-provider";
import { PageLoader } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { JOB_TYPE_LABELS } from "@/lib/constants";
import {
  formatSalary,
  formatExperience,
  formatDate,
} from "@/lib/utils";
import {
  MapPin,
  Banknote,
  Briefcase,
  Clock,
  Building2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { FileUpload } from "@/components/shared/file-upload";
import { useToast } from "@/components/ui/toast";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const jobId = params.id as string;

  const { data: job, isLoading } = useJob(jobId);
  const createApplication = useCreateApplication();

  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }
    try {
      await createApplication.mutateAsync({ jobId, coverLetter, resume: resumeUrl || undefined });
      setApplied(true);
      addToast({
        title: "Application Submitted!",
        description: "Your application has been sent to the employer.",
      });
      setTimeout(() => {
        router.push("/dashboard/candidate/applications");
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit application";
      addToast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <PageLoader />;
  if (!job) return <div className="py-12 text-center text-muted-foreground">Job not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <div className="space-y-6">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{job.title}</h1>
              {job.company && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{job.company.name}</span>
                </div>
              )}
            </div>
            <Badge variant="secondary" className="w-fit">
              {JOB_TYPE_LABELS[job.jobType] || job.jobType}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Banknote className="h-4 w-4" />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            {formatExperience(job.experienceMin, job.experienceMax)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Posted {formatDate(job.createdAt)}
          </span>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
              {job.description}
            </div>
          </CardContent>
        </Card>

        {job.skills && job.skills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: string) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Apply for this position</CardTitle>
          </CardHeader>
          <CardContent>
            {applied ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="font-semibold">Application Submitted!</p>
                <p className="text-sm text-muted-foreground">
                  The employer will review your application soon.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <FileUpload
                  label="Resume"
                  description="PDF, DOC, or DOCX (max 5MB)"
                  currentFile={resumeUrl}
                  onUploadComplete={(url) => setResumeUrl(url)}
                  onRemove={() => setResumeUrl(null)}
                />
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter (optional)</Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Tell the employer why you're a great fit..."
                    rows={5}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleApply}
                  disabled={createApplication.isPending}
                  className="w-full sm:w-auto"
                >
                  {createApplication.isPending
                    ? "Submitting..."
                    : isAuthenticated
                    ? "Submit Application"
                    : "Login to Apply"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
