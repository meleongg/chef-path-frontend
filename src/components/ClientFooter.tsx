"use client";

import Link from "next/link";

export default function ClientFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/20 bg-background/80 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🍳</span>
              </div>
              <span className="text-lg font-semibold text-primary">
                ChefPath
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your adaptive cooking mentor that grows with you.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-primary mb-1">Quick Links</h3>
            <Link
              href="/weekly-plan"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Weekly Plan
            </Link>
            <Link
              href="/progress"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              My Progress
            </Link>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-primary mb-1">Support</h3>
            <a
              href="mailto:support@chefpath.com"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contact Us
            </a>
            <Link
              href="/help"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Help Center
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border/20 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ChefPath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
