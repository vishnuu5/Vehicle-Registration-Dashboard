import { Dashboard } from "@/components/dashboard";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function HomePage() {
  return (
    <>
      <header className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 border-b bg-background sticky top-0 z-40">
        <SidebarTrigger className="md:h-7 md:w-7 h-8 w-8" />
        <div className="h-4 w-px bg-border" />
        <h1 className="text-base md:text-lg lg:text-2xl font-bold truncate">
          Vehicle Registration Dashboard
        </h1>
      </header>
      <Dashboard />
    </>
  );
}
