"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Banknote,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { JOB_TYPE_LABELS } from "@/lib/constants";
import { formatSalary, formatExperience, formatDate } from "@/lib/utils";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    jobType: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    experienceMin?: number | null;
    experienceMax?: number | null;
    skills?: string[];
    createdAt: string;
    company?: { name: string; id: string };
    applicationCount?: number;
  };
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="group transition-all hover:shadow-md hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
              {job.title}
            </CardTitle>
            {job.company && (
              <Link
                href={`/companies/${job.company.id}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {job.company.name}
              </Link>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            {JOB_TYPE_LABELS[job.jobType] || job.jobType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {job.description}
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5" />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {formatExperience(job.experienceMin, job.experienceMax)}
          </span>
        </div>
        {job.skills && job.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs font-normal">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{job.skills.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-4 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(job.createdAt)}
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/jobs/${job.id}`}>
            View Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
