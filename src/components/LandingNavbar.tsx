"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LandingNavbar() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  return (
    <nav className="relative border-b border-border/20 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center shadow-warm">
              <span className="text-xl">🍳</span>
            </div>
            <span className="text-2xl font-bold text-primary">ChefPath</span>
          </div>

          {/* Login + CTA Buttons in Nav */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/login")}
              className="text-primary bg-transparent hover:underline px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--paprika))]"
              aria-label="Login to ChefPath"
            >
              Login
            </Button>

            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-6 py-2 shadow-warm hover:shadow-cozy transition-all duration-300"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
