"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/shared/file-upload";
import {
  VERIFICATION_STATUS_LABELS,
} from "@/lib/constants";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { User, Mail, Phone, Briefcase, GraduationCap, Globe, Pencil, Check, X } from "lucide-react";

export default function CandidateProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    experience: user?.experience?.toString() || "",
    education: user?.education || "",
    bio: user?.bio || "",
    linkedin: user?.linkedin || "",
    skills: user?.skills?.join(", ") || "",
  });

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(API_ENDPOINTS.auth.profile, {
        name: form.name,
        experience: form.experience ? parseInt(form.experience) : null,
        education: form.education || null,
        bio: form.bio || null,
        linkedin: form.linkedin || null,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      await refreshProfile();
      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (url: string) => {
    try {
      await api.put(API_ENDPOINTS.auth.profile, { resume: url });
      await refreshProfile();
    } catch {
    }
  };

  const infoItems = [
    { icon: <Mail className="h-4 w-4" />, label: "Email", value: user.email },
    { icon: <Phone className="h-4 w-4" />, label: "Phone", value: user.phone || "Not provided" },
    {
      icon: <Briefcase className="h-4 w-4" />,
      label: "Experience",
      value: user.experience ? `${user.experience} years` : "Not specified",
    },
    {
      icon: <GraduationCap className="h-4 w-4" />,
      label: "Education",
      value: user.education || "Not specified",
    },
    {
      icon: <Globe className="h-4 w-4" />,
      label: "LinkedIn",
      value: user.linkedin || "Not provided",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your profile information</p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <Badge variant="secondary" className="mt-1">
                {VERIFICATION_STATUS_LABELS[user.verificationStatus] || user.verificationStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            label="Resume"
            description="PDF, DOC, or DOCX (max 5MB)"
            currentFile={user.resume ? user.resume.split("/").pop() : null}
            onUploadComplete={handleResumeUpload}
            onRemove={async () => {
              try {
                await api.put(API_ENDPOINTS.auth.profile, { resume: null });
                await refreshProfile();
              } catch {}
            }}
          />
        </CardContent>
      </Card>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  placeholder="e.g. B.Tech Computer Science"
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/..."
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g. JavaScript, React, Node.js"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell employers about yourself..."
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {infoItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="text-muted-foreground mt-0.5">{item.icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {user.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {user.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {user.skills && user.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
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
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium capitalize">{user.role?.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email Status</span>
                  <span className="font-medium">
                    {user.verificationStatus !== "UNVERIFIED" ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
