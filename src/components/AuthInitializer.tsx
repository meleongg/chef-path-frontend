"use client";

import { useUser } from "@/hooks";
import { useEffect, useState } from "react";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initializeUser } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeUser();
      setIsInitialized(true);
    };
    init();
  }, []);

  // Show loading while initializing auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
