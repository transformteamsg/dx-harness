import { AppSidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/* The documentation shell — topbar, sidebar, and the 1080px reading column.
   This used to live in the root layout, which meant the landing inherited the
   docs sidebar too. Splitting it into a route group lets the landing carry its
   own chrome without changing a single URL: route groups are invisible to the
   router. */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      className="flex-col"
      style={{ "--header-height": "3.5rem" } as React.CSSProperties}
    >
      <TopBar />
      <div className="flex w-full flex-1">
        <AppSidebar />
        <SidebarInset>
          <main
            id="main-content"
            className="mx-auto w-full max-w-[1080px] min-w-0 px-6 py-10 lg:px-12"
          >
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
