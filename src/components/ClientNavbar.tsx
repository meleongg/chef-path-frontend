"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function ClientNavbar() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }
  if (pathname === "/onboarding") {
    return <Navbar showMinimal />;
  }
  return <Navbar />;
}
