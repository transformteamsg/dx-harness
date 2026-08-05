import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { AppSidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: { default: "TFX Design Standard", template: "%s — TFX Design Standard" },
  description:
    "How TransformX designs the Teacher & School portfolio: principles, checkable standards, guidelines, foundations, and the AI design harness. For human builders and AI agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-(--color-tw-blue)"
        >
          Skip to main content
        </a>
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
      </body>
    </html>
  );
}
