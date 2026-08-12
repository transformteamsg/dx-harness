"use client";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* The no-CLI install path, hosted in a dialog off the hero's inline question
   (user decision 2026-08-12; previously a page-bottom section). Simple
   single-section content, so a dialog fits (SLP-10). The popup portals to
   <body>, outside the landing shell, so it carries `landing-dark` itself to
   stay in the landing's token world. */
export function NoCliDialog({ triggerClassName }: { triggerClassName?: string }) {
  return (
    <Dialog>
      <DialogTrigger
        className={`cursor-pointer text-tw-blue-text underline underline-offset-4 hover:text-foreground ${triggerClassName ?? ""}`}
      >
        No command line?
      </DialogTrigger>
      <DialogContent className="landing-dark bg-surface text-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold tracking-tight">
            No command line?
          </DialogTitle>
          <DialogDescription>
            Install the same plugin from the Claude web app or Desktop.
          </DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground marker:font-mono">
          <li>
            Open{" "}
            <strong className="font-medium text-foreground">Customize → Plugins</strong>.
          </li>
          <li>
            Add a marketplace from the repository{" "}
            <span className="font-mono text-foreground">transformteamsg/dx-harness</span>.
          </li>
          <li>
            Install <strong className="font-medium text-foreground">dx-harness</strong>{" "}
            and use any skill by typing{" "}
            <span className="font-mono text-foreground">/</span> in a chat.
          </li>
        </ol>
        <p className="border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
          Working in a repo? Run{" "}
          <span className="font-mono text-foreground">/dx-harness:dx-design-setup</span> once —
          it checks the per-person tools the loop relies on. The full standard is{" "}
          <Link
            href="/overview"
            className="text-tw-blue-text underline underline-offset-4 hover:text-foreground"
          >
            published in the docs
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
