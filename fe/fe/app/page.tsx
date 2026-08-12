"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Shield,
  Building2,
  Search,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Verified Companies",
    description: "Every company goes through a rigorous verification process before posting jobs.",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Trusted Employers",
    description: "Connect only with approved and verified employers on the platform.",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Smart Search",
    description: "Find jobs with advanced filters for location, salary, skills, and more.",
  },
];

const steps = [
  "Create your free account",
  "Complete your profile",
  "Browse verified jobs",
  "Apply with one click",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm mb-6">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                Trusted Recruitment Platform
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Find your next{" "}
                <span className="text-primary">trusted</span>{" "}
                career opportunity
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
                Connect with verified companies and discover opportunities that match
                your skills. No fake listings, no scams — just trusted connections.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/jobs">
                    Browse Jobs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/register">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold sm:text-3xl">Why TrustHire?</h2>
              <p className="mt-2 text-muted-foreground">
                Built for security and trust in recruitment
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-background p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="rounded-lg bg-primary/10 p-3 text-primary w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Get started in minutes
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Your trusted career journey begins with a few simple steps.
                </p>
                <ul className="mt-8 space-y-4">
                  {steps.map((step, i) => (
                    <li key={step} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8" asChild>
                  <Link href="/auth/register">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="rounded-xl border bg-muted/30 p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-background p-4 text-center">
                    <p className="text-3xl font-bold text-primary">500+</p>
                    <p className="text-xs text-muted-foreground mt-1">Verified Jobs</p>
                  </div>
                  <div className="rounded-lg border bg-background p-4 text-center">
                    <p className="text-3xl font-bold text-primary">100+</p>
                    <p className="text-xs text-muted-foreground mt-1">Companies</p>
                  </div>
                  <div className="rounded-lg border bg-background p-4 text-center">
                    <p className="text-3xl font-bold text-primary">10K+</p>
                    <p className="text-xs text-muted-foreground mt-1">Candidates</p>
                  </div>
                  <div className="rounded-lg border bg-background p-4 text-center">
                    <p className="text-3xl font-bold text-primary">99%</p>
                    <p className="text-xs text-muted-foreground mt-1">Trust Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TrustHire. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/jobs" className="hover:text-foreground transition-colors">
                Find Jobs
              </Link>
              <Link href="/auth/register" className="hover:text-foreground transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
