"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function ClientNavbar() {
  const pathname = usePathname();
  // Only show Navbar on authenticated pages (not landing or login)
  const showNavbar =
    pathname !== "/" && pathname !== "/login" && pathname !== "/onboarding";

  return showNavbar ? <Navbar /> : null;
}
