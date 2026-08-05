import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  GitPullRequest,
  MessageSquare,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

/* Glossary - a rowed card that pairs a Lucide icon with a short line of text (a
   term, a habit, a step), so a list reads visually instead of as a flat table.
   Each Term takes MDX children (so **bold** and links render) and an `icon` key
   mapped to a Lucide glyph rendered at the standard 20px / stroke 2 /
   currentColor. Shares Checklist's card + divided-row structure. */
const ICONS: Record<string, LucideIcon> = {
  "folder-git-2": FolderGit2,
  copy: Copy,
  "git-branch": GitBranch,
  "git-commit-horizontal": GitCommitHorizontal,
  "arrow-up-from-line": ArrowUpFromLine,
  "arrow-down-to-line": ArrowDownToLine,
  "git-pull-request": GitPullRequest,
  "git-merge": GitMerge,
  "message-square": MessageSquare,
  "undo-2": Undo2,
};

export function Glossary({ children }: { children?: ReactNode }) {
  return (
    <figure className="mb-5 mt-4 overflow-hidden rounded-lg border border-border bg-surface">
      <ul className="m-0 list-none divide-y divide-border p-0">{children}</ul>
    </figure>
  );
}

export function Term({ icon, children }: { icon: string; children?: ReactNode }) {
  const Icon = ICONS[icon] ?? FolderGit2;
  return (
    <li className="mb-0 flex items-start gap-3 px-4 py-3">
      <Icon size={20} strokeWidth={2} aria-hidden className="mt-0.5 shrink-0 text-muted-foreground" />
      <span className="text-sm leading-[1.6] text-(--prose-body)">{children}</span>
    </li>
  );
}
