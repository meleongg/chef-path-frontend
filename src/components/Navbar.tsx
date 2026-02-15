"use client";

import { Button } from "@/components/ui/button";
import { actions, useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Calendar, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar({
  showMinimal = false,
}: {
  showMinimal?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { dispatch } = useApp();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/weekly-plan", label: "Weekly Plan", Icon: Calendar },
    { href: "/analytics", label: "Analytics", Icon: BarChart3 },
    { href: "/settings/preferences", label: "Preferences", Icon: Settings },
    { href: "/settings/account", label: "Account", Icon: User },
  ];

  const handleLogout = async () => {
    // Logout via AuthContext (clears refresh token cookie)
    await logout();
    
    // Reset app state
    dispatch(actions.resetState());
    
    // Redirect to landing page
    router.push("/");
  };

  return (
    <nav className="w-full bg-gradient-to-r from-amber-50/80 via-white/80 to-orange-50/80 backdrop-blur-md border-b-2 border-[hsl(var(--paprika))]/20 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href="/weekly-plan"
          className="text-xl font-bold text-[hsl(var(--paprika))] tracking-tight hover:text-orange-600 transition-colors"
        >
          ChefPath
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-2 items-center">
          {!showMinimal &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  pathname.startsWith(link.href)
                    ? "bg-[hsl(var(--paprika))]/10 text-[hsl(var(--paprika))] font-semibold"
                    : "text-gray-600 hover:bg-amber-100/60 hover:text-[hsl(var(--paprika))]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          <Button
            variant="outline"
            onClick={handleLogout}
            size="sm"
            className="border-2 border-[hsl(var(--paprika))]/40 text-[hsl(var(--paprika))] hover:bg-[hsl(var(--paprika))] hover:text-white hover:border-[hsl(var(--paprika))] transition-all duration-200 font-semibold"
          >
            Logout
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-amber-100/60 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-[hsl(var(--paprika))]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[hsl(var(--paprika))]/20 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-2 space-y-1">
            {!showMinimal &&
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                    pathname.startsWith(link.href)
                      ? "bg-[hsl(var(--paprika))]/10 text-[hsl(var(--paprika))] font-semibold"
                      : "text-gray-600 hover:bg-amber-100/60 hover:text-[hsl(var(--paprika))]"
                  }`}
                >
                  <link.Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-2 border-[hsl(var(--paprika))]/40 text-[hsl(var(--paprika))] hover:bg-[hsl(var(--paprika))] hover:text-white hover:border-[hsl(var(--paprika))] transition-all duration-200 font-semibold mt-2"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
