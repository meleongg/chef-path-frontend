import ClientNavbar from "@/components/ClientNavbar";
import { AppProvider } from "@/contexts/AppContext";
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
        <ClientNavbar />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
