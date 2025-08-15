import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../app/globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vehicle Registration Dashboard",
  description: "Investor-friendly dashboard for vehicle registration data.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset className="w-full md:ml-0 lg:ml-44">
            {children}
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
