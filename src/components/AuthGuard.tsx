"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export default function AuthGuard({
  children,
  requireOnboarding = false,
}: AuthGuardProps) {
  const { user, isAuthenticated, isInitialized, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize before making decisions
    if (!isInitialized) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If authenticated but needs onboarding, check if profile is complete
    if (requireOnboarding && user) {
      const needsOnboarding =
        !user.frequency ||
        !user.cuisine ||
        !user.skill_level ||
        !user.user_goal;
      if (needsOnboarding) {
        router.push("/onboarding");
        return;
      }
    }
  }, [user, isAuthenticated, isInitialized, requireOnboarding, router]);

  // Show loading state while initializing or during auth checks
  if (!isInitialized || isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
