import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { Providers } from "./Providers";
import { AIChatSidebar } from "@/components/AIChatSidebar";
import { AISidebarProvider } from "@/components/AISidebarContext";
import { AIToggleButton } from "@/components/AIToggleButton";
import { ConditionalAIChat } from "@/components/ConditionalAIChat";
import { NavigationProvider } from "@/components/NavigationContext";
import { UserProvider } from "@/components/UserContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import "../globals.css";
import "../liveblocks.css";

export const metadata: Metadata = {
  title: "Liveblocks",
  description:
    "This example shows how to build a project manager using Liveblocks, and Next.js.",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} absolute inset-0`}>
      <head>
        <link
          href="https://liveblocks.io/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="https://liveblocks.io/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
      </head>
      <body className="bg-neutral-200/50 dark:bg-dark-bg-primary text-neutral-900 dark:text-dark-text-primary antialiased h-full w-full overflow-hidden transition-colors duration-200">
        <ThemeProvider>
          <AISidebarProvider>
            <NavigationProvider>
              <UserProvider>
                <Providers>{children}</Providers>

                {/* AI Chat Sidebar - Conditionally shown */}
                <ConditionalAIChat />
              </UserProvider>
            </NavigationProvider>
          </AISidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
