"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp, actions } from "@/contexts/AppContext";

export default function Navbar({ showMinimal = false }: { showMinimal?: boolean }) {
  const pathname = usePathname();
  const { dispatch } = useApp();
  const navLinks = [
    { href: "/weekly-plan", label: "Weekly Plan" },
    { href: "/progress", label: "Progress" },
    // { href: "/profile", label: "Profile" }, // Uncomment if/when profile is implemented
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chefpath_token");
      dispatch(actions.resetState());
      window.location.href = "/";
    }
  };

  return (
    <nav className="w-full bg-white/80 border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-2">
        <Link
          href="/weekly-plan"
          className="text-xl font-bold text-primary tracking-tight"
        >
          ChefPath
        </Link>
        <div className="flex gap-4">
          {showMinimal ? (
            <Button
              variant="outline"
              onClick={handleLogout}
              aria-label="Logout"
            >
              Logout
            </Button>
          ) : (
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
            ))
          )}
        </div>
      </div>
    </nav>
  );
}
