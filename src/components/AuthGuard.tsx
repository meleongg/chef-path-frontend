"use client";

import { useUser } from "@/hooks";
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
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/login");
      return;
    }
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
  }, [user, userLoading, requireOnboarding, router]);

  if (userLoading || !user) {
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
