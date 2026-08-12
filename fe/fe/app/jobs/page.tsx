"use client";

import { useState } from "react";
import { useJobs } from "@/hooks/use-jobs";
import { JobCard } from "@/components/shared/job-card";
import { PageLoader } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationWrapper } from "@/components/shared/pagination-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOB_TYPE_LABELS } from "@/lib/constants";
import { Search, X } from "lucide-react";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [page, setPage] = useState(1);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedLocation, setAppliedLocation] = useState("");
  const [appliedJobType, setAppliedJobType] = useState("");

  const { data, isLoading } = useJobs({
    search: appliedSearch || undefined,
    location: appliedLocation || undefined,
    jobType: appliedJobType || undefined,
    page,
    limit: 9,
  });

  const jobs = data?.data || data?.jobs || [];
  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / 9);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setAppliedLocation(location);
    setAppliedJobType(jobType);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setAppliedSearch("");
    setAppliedLocation("");
    setAppliedJobType("");
    setPage(1);
  };

  const hasFilters = appliedSearch || appliedLocation || appliedJobType;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Find Jobs</h1>
        <p className="mt-1 text-muted-foreground">
          Discover verified opportunities from trusted companies
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="sm:max-w-[200px]"
          />
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="sm:max-w-[180px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="sm:w-auto">
            <Search className="h-4 w-4 sm:hidden" />
            <span className="sm:inline">Search</span>
          </Button>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} type="button">
            <X className="h-3.5 w-3.5 mr-1" />
            Clear filters
          </Button>
        )}
      </form>

      {isLoading ? (
        <PageLoader />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try adjusting your search filters or check back later for new opportunities."
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {total} job{total !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job: Record<string, unknown>) => (
              <JobCard
                key={job.id as string}
                job={job as React.ComponentProps<typeof JobCard>["job"]}
              />
            ))}
          </div>
          <div className="mt-8">
            <PaginationWrapper
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
