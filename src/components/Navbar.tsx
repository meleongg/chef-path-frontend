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
    // { href: "/profile", label: "Profile" }, // Uncomment if/when profile is implemented
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
          className="text-xl font-bold text-primary tracking-tight"
        >
          ChefPath
        </Link>
        <div className="flex gap-4">
          {!showMinimal &&
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium px-2 py-1 rounded transition-colors duration-150 ${
                  pathname.startsWith(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/20"
                }`}
              >
                {link.label}
              </Link>
            ))}
          <Button variant="outline" onClick={handleLogout} aria-label="Logout">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
