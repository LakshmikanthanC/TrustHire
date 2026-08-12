"use client";

import * as React from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SheetSide = "top" | "right" | "bottom" | "left";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: SheetSide;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be used within <Sheet>");
  return ctx;
}

function Sheet({ defaultOpen = false, open: controlledOpen, onOpenChange, side = "right", children }: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SheetSide;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [controlledOpen, onOpenChange]
  );

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <SheetContext.Provider value={{ open, setOpen, side }}>{children}</SheetContext.Provider>
  );
}

function SheetTrigger({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useSheetContext();
  return (
    <button type="button" onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
}

const sideVariants = {
  top: { initial: { y: "-100%" }, animate: { y: 0 }, exit: { y: "-100%" } },
  bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
  right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
} as const;

const sideClasses: Record<SheetSide, string> = {
  top: "inset-x-0 top-0 border-b",
  bottom: "inset-x-0 bottom-0 border-t",
  left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
  right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
};

const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { side?: SheetSide }>(
  ({ className, children, side: sideProp, ...props }, ref) => {
    const { open, setOpen, side: contextSide } = useSheetContext();
    const side = sideProp ?? contextSide;
    const v = sideVariants[side];

    React.useEffect(() => {
      function handleEscape(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
      }
      if (open) document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open, setOpen]);

    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80"
              onClick={() => setOpen(false)}
            />
            <div
              ref={ref}
              className={cn(
                "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
                sideClasses[side],
                className
              )}
              {...props}
            >
              {children}
              <button
                type="button"
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
  )
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
SheetDescription.displayName = "SheetDescription";

function SheetClose({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useSheetContext();
  return (
    <button type="button" onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  );
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose };
