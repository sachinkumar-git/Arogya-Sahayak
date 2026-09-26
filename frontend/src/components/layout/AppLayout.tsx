import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { ListSkeleton } from "@/components/common/PageStates";
import { useSession } from "@/context/SessionContext";
import { cn } from "@/lib/utils";
import { BottomNav, Navbar } from "./Navbar";
import { SkipLink } from "./SkipLink";

export function AppLayout() {
  const { user } = useSession();
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <Navbar />
      <main id="main" tabIndex={-1} className={cn("container flex-1 px-4 py-6 sm:px-6 sm:py-8", user && "pb-28 lg:pb-10")}>
        <Suspense fallback={<ListSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
