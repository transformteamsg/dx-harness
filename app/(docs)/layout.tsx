import { AppSidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { PrevNext } from "@/components/prev-next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/* Docs shell: top bar + collapsible section sidebar. The landing page has its
   own navigation (app/(landing)/layout.tsx) and never renders this chrome. */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      className="flex-col"
      style={{ "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <TopBar />
      <div className="flex w-full flex-1">
        <AppSidebar />
        {/* Content pane sits on --surface (white) so the sidebar's --background
            rail reads as a distinct panel, not the same sheet. */}
        <SidebarInset className="bg-surface">
          <main
            id="main-content"
            className="mx-auto w-full max-w-[1080px] min-w-0 px-6 py-10 lg:px-12"
          >
            {children}
            <PrevNext />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
