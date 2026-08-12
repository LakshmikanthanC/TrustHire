"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface FileUploadProps {
  accept?: string;
  label?: string;
  description?: string;
  onUploadComplete: (url: string, filename: string) => void;
  currentFile?: string | null;
  onRemove?: () => void;
}

export function FileUpload({
  accept = ".pdf,.doc,.docx",
  label = "Upload Resume",
  description = "PDF, DOC, or DOCX (max 5MB)",
  onUploadComplete,
  currentFile,
  onRemove,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post(API_ENDPOINTS.upload.resume, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const result = data.data;
        setUploadedName(result.originalName);
        onUploadComplete(result.url, result.originalName);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Upload failed";
        setError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setUploadedName(null);
    setError(null);
    onRemove?.();
  };

  const displayName = uploadedName || currentFile;

  if (displayName) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
        <FileText className="h-8 w-8 shrink-0 text-blue-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Uploaded
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload-input")?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop or <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
