import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/components/QueryProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ChefPath - Your Adaptive Cooking Mentor",
  description:
    "Learn to cook with personalized weekly meal plans that adapt to your skill level and preferences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <QueryProvider>
            <AppProvider>{children}</AppProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
