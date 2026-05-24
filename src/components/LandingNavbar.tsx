"use client";

import { Button } from "@/components/ui/button";
import { ChefHat, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LandingNavbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleGetStarted = () => {
    closeMenu();
    router.push("/onboarding");
  };

  const ctaClassName =
    "bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-600 hover:from-orange-600 hover:to-[hsl(var(--paprika))] text-white font-bold shadow-md hover:shadow-lg ring-1 ring-[hsl(var(--paprika))]/25 transition-all duration-300";

  const mobileLinkClassName =
    "w-full justify-start h-11 px-4 text-base font-medium text-gray-700 hover:text-[hsl(var(--paprika))] hover:bg-white/50 rounded-lg border border-transparent hover:border-[hsl(var(--paprika))]/15";

  return (
    <nav className="sticky top-0 z-50 border-b border-[hsl(var(--paprika))]/20 bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-90 transition-opacity"
            onClick={closeMenu}
          >
            <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center shadow-warm">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-[hsl(var(--paprika))]" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-[hsl(var(--paprika))] truncate">
              ChefPath
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="text-gray-700 hover:text-[hsl(var(--paprika))] hover:bg-white/50 px-3 sm:px-4"
              aria-label="Login to ChefPath"
            >
              Login
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/register")}
              className="text-gray-700 hover:text-[hsl(var(--paprika))] hover:bg-white/50 px-3 sm:px-4"
              aria-label="Register for ChefPath"
            >
              Register
            </Button>
            <Button
              onClick={handleGetStarted}
              className={`${ctaClassName} px-5 lg:px-6 py-2 text-sm lg:text-base`}
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            {!mobileMenuOpen && (
              <Button
                onClick={handleGetStarted}
                size="sm"
                className={`${ctaClassName} px-3 py-2 text-sm whitespace-nowrap`}
              >
                Get Started
              </Button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 rounded-lg bg-white/40 hover:bg-white/60 border border-[hsl(var(--paprika))]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--paprika))]/40"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[hsl(var(--paprika))]" />
              ) : (
                <Menu className="w-5 h-5 text-[hsl(var(--paprika))]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu — continues the warm header gradient */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[hsl(var(--paprika))]/15 bg-gradient-to-b from-amber-100/90 via-orange-50/80 to-amber-50/90 pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
            <div className="flex flex-col gap-2 pt-3">
              <Button
                variant="ghost"
                onClick={() => {
                  closeMenu();
                  router.push("/login");
                }}
                className={mobileLinkClassName}
              >
                Login
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  closeMenu();
                  router.push("/register");
                }}
                className={mobileLinkClassName}
              >
                Register
              </Button>
              <Button
                onClick={handleGetStarted}
                className={`${ctaClassName} w-full h-11 mt-1 text-base`}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
