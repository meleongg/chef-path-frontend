"use client";

import AuthGuard from "@/components/AuthGuard";
import ClientNavbar from "@/components/ClientNavbar";
import FloatingChat from "@/components/FloatingChat";
import { useUser, useWeeklyPlans, useWeeklyRecipeProgress } from "@/hooks";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { loadWeeklyPlans, currentWeek } = useWeeklyPlans();
  const { loadWeeklyRecipeProgress } = useWeeklyRecipeProgress();

  // Load data once when user is available
  useEffect(() => {
    if (user) {
      const initializeData = async () => {
        // Load weekly plans
        await loadWeeklyPlans(user.id);

        // Load recipe progress for current week
        if (currentWeek > 0) {
          await loadWeeklyRecipeProgress(user.id, currentWeek);
        }
      };

      initializeData();
    }
  }, [user?.id, currentWeek]);

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
