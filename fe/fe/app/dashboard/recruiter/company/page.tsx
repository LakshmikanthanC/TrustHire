"use client";

import { useState } from "react";
import { useCompanyProfile, useRegisterCompany } from "@/hooks/use-companies";
import { PageLoader } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  COMPANY_STATUS_LABELS,
  COMPANY_STATUS_COLORS,
} from "@/lib/constants";
import { Building2, Globe, MapPin, FileText } from "lucide-react";

export default function RecruiterCompanyPage() {
  const { data: company, isLoading } = useCompanyProfile();
  const registerCompany = useRegisterCompany();
  const { addToast } = useToast();
  const [form, setForm] = useState({
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
    recruiterName: "",
    recruiterDesignation: "",
    recruiterEmail: "",
    recruiterPhone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerCompany.mutateAsync(form);
      addToast({ title: "Company Registered", description: "Your company is now pending verification by an admin." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      addToast({ title: "Registration Failed", description: message, variant: "destructive" });
    }
  };

  if (isLoading) return <PageLoader />;
  if (!company) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Register Company</h1>
          <p className="text-muted-foreground">
            Register your company to start posting jobs and reviewing applications.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number *</Label>
                  <Input id="registrationNumber" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input id="gstNumber" name="gstNumber" value={form.gstNumber} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input id="pan" name="pan" value={form.pan} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website *</Label>
                  <Input id="website" name="website" type="url" value={form.website} onChange={handleChange} required placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email *</Label>
                  <Input id="companyEmail" name="companyEmail" type="email" value={form.companyEmail} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input id="address" name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" value={form.city} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" name="state" value={form.state} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recruiter Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recruiterName">Your Name *</Label>
                  <Input id="recruiterName" name="recruiterName" value={form.recruiterName} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recruiterDesignation">Designation *</Label>
                  <Input id="recruiterDesignation" name="recruiterDesignation" value={form.recruiterDesignation} onChange={handleChange} required placeholder="e.g. HR Manager" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recruiterEmail">Your Email *</Label>
                  <Input id="recruiterEmail" name="recruiterEmail" type="email" value={form.recruiterEmail} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recruiterPhone">Your Phone *</Label>
                  <Input id="recruiterPhone" name="recruiterPhone" value={form.recruiterPhone} onChange={handleChange} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={registerCompany.isPending}>
              {registerCompany.isPending ? "Registering..." : "Register Company"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-muted-foreground">Company Profile</p>
        </div>
        <Badge
          className={
            COMPANY_STATUS_COLORS[company.status] || "bg-gray-100 text-gray-800"
          }
        >
          {COMPANY_STATUS_LABELS[company.status] || company.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {company.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">About</p>
              <p className="text-sm whitespace-pre-wrap">{company.description}</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {company.industry && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Industry:</span>
                <span className="font-medium">{company.industry}</span>
              </div>
            )}
            {company.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{company.location}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Website:</span>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
            {company.size && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{company.size}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {company.documents && company.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {company.documents.map((doc: Record<string, unknown>, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm">{(doc.name as string) || `Document ${i + 1}`}</span>
                  <Badge variant="outline">
                    {(doc.status as string) || "pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
