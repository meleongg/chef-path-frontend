"use client";

import { Button } from "@/components/ui/button";
import { actions, useApp } from "@/contexts/AppContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({
  showMinimal = false,
}: {
  showMinimal?: boolean;
}) {
  const pathname = usePathname();
  const { dispatch } = useApp();
  const navLinks = [
    { href: "/weekly-plan", label: "Weekly Plan" },
    { href: "/settings/preferences", label: "Preferences" },
    { href: "/settings/account", label: "Account" },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chefpath_token");
      localStorage.removeItem("chefpath_user_id");
      dispatch(actions.resetState());
      window.location.href = "/";
    }
  };

  return (
    <nav className="w-full bg-gradient-to-r from-amber-50/80 via-white/80 to-orange-50/80 backdrop-blur-md border-b-2 border-[hsl(var(--paprika))]/20 shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link
          href="/weekly-plan"
          className="text-xl font-bold text-[hsl(var(--paprika))] tracking-tight hover:text-orange-600 transition-colors"
        >
          ChefPath
        </Link>
        <div className="flex gap-4 items-center">
          {!showMinimal &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
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
            aria-label="Logout"
            className="border-2 border-[hsl(var(--paprika))]/40 text-[hsl(var(--paprika))] hover:bg-[hsl(var(--paprika))] hover:text-white hover:border-[hsl(var(--paprika))] transition-all duration-200 font-semibold"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
