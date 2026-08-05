/* Rendered iconography specimen for the Iconography foundations page: a
   sample of the Lucide set the standard names. Icons are decorative
   (aria-hidden) — the visible kebab-case name beside each glyph carries the
   meaning, so nothing depends on recognising the shape alone (A11Y-3
   territory). Flat grid, no card-per-icon chrome (SLP-11). */

import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  MessageSquare,
  Search,
  Settings,
  Users,
} from "lucide-react";

const ICONS = [
  { name: "calendar", Icon: Calendar },
  { name: "clipboard-list", Icon: ClipboardList },
  { name: "graduation-cap", Icon: GraduationCap },
  { name: "message-square", Icon: MessageSquare },
  { name: "bell", Icon: Bell },
  { name: "search", Icon: Search },
  { name: "settings", Icon: Settings },
  { name: "users", Icon: Users },
  { name: "file-text", Icon: FileText },
  { name: "check-circle-2", Icon: CheckCircle2 },
  { name: "alert-triangle", Icon: AlertTriangle },
  { name: "chevron-right", Icon: ChevronRight },
] as const;

export function IconSet() {
  return (
    <figure className="my-8">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {ICONS.map(({ name, Icon }) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <Icon aria-hidden size={20} strokeWidth={2} />
              <span className="text-center text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 max-w-[60ch] text-xs leading-[1.6] text-muted-foreground">
        Standard sizes: 16 / 20 / 24px, stroke ~2px, colour follows{" "}
        <code>currentColor</code>.
      </figcaption>
    </figure>
  );
}
