"use client";

import AuthGuard from "@/components/AuthGuard";
import ClientNavbar from "@/components/ClientNavbar";
import FloatingChat from "@/components/FloatingChat";
import { useApp } from "@/contexts/AppContext";
import { useUser } from "@/hooks";
import {
  useWeeklyPlansQuery,
  useWeeklyRecipeProgressQuery,
} from "@/hooks/queries";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { state } = useApp();
  const currentWeek = state.currentWeek;

  // TanStack Query automatically fetches and caches data
  // These hooks will deduplicate requests if called from multiple components
  useWeeklyPlansQuery(user?.id);
  useWeeklyRecipeProgressQuery(user?.id, currentWeek);

  // Note: No manual loading needed!
  // Queries automatically fetch when enabled (user?.id exists)
  // Data is cached and shared with all child components

  return (
    <AuthGuard requireOnboarding>
      <div className="flex flex-col min-h-screen">
        <ClientNavbar />
        <main className="flex-1">{children}</main>
        <FloatingChat />
      </div>
    </AuthGuard>
  );
}
