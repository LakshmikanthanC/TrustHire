import { Header } from "@/components/layout/header";

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} TrustHire. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
