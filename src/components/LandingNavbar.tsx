"use client";

import {
  navBrandTextClassName,
  navContainerClassName,
  navCtaClassName,
  navGhostButtonClassName,
  navLogoIconBoxClassName,
  navLogoIconClassName,
  navLogoLinkClassName,
  navMobileLinkClassName,
  navMobileMenuPanelClassName,
  navMobileMenuToggleClassName,
  navRowClassName,
  navShellClassName,
} from "@/components/navStyles";
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

  return (
    <nav className={navShellClassName}>
      <div className={navContainerClassName}>
        <div className={navRowClassName}>
          <Link href="/" className={navLogoLinkClassName} onClick={closeMenu}>
            <div className={navLogoIconBoxClassName}>
              <ChefHat className={navLogoIconClassName} />
            </div>
            <span className={navBrandTextClassName}>ChefPath</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className={`${navGhostButtonClassName} px-3 sm:px-4`}
              aria-label="Login to ChefPath"
            >
              Login
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/register")}
              className={`${navGhostButtonClassName} px-3 sm:px-4`}
              aria-label="Register for ChefPath"
            >
              Register
            </Button>
            <Button
              onClick={handleGetStarted}
              className={`${navCtaClassName} px-5 lg:px-6 py-2 text-sm lg:text-base`}
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
                className={`${navCtaClassName} px-3 py-2 text-sm whitespace-nowrap`}
              >
                Get Started
              </Button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className={navMobileMenuToggleClassName}
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

        {mobileMenuOpen && (
          <div className={navMobileMenuPanelClassName}>
            <div className="flex flex-col gap-2 pt-3">
              <Button
                variant="ghost"
                onClick={() => {
                  closeMenu();
                  router.push("/login");
                }}
                className={navMobileLinkClassName}
              >
                Login
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  closeMenu();
                  router.push("/register");
                }}
                className={navMobileLinkClassName}
              >
                Register
              </Button>
              <Button
                onClick={handleGetStarted}
                className={`${navCtaClassName} w-full h-11 mt-1 text-base`}
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
