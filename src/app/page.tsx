"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LandingNavbar from "@/components/LandingNavbar";

export default function Home() {
  const router = useRouter();
  const { user, initializeUser, isLoading } = useUser();

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (user) {
      router.push("/weekly-plan");
    }
  }, [user, router]);

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/15 via-background to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Setting up your kitchen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 via-background to-primary/15 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_25%),radial-gradient(circle_at_70%_80%,hsl(var(--accent))_0%,transparent_25%),radial-gradient(circle_at_40%_60%,hsl(var(--secondary))_0%,transparent_20%)] opacity-5"></div>

      {/* Navigation Bar */}
      <LandingNavbar />

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Your Personal{" "}
                <span className="text-primary">Cooking Mentor</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Get personalized weekly meal plans that adapt to your skill
                level, preferences, and feedback. Learn to cook at your own
                pace! 🍳
              </p>
            </div>

            {/* Primary CTA */}
            <div className="space-y-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-cozy hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">🚀</span>
                  Start Your Cooking Journey
                </span>
              </Button>
              <p className="text-sm text-muted-foreground">
                ⏱️ Takes less than 2 minutes • No credit card required
              </p>
            </div>

            {/* Quick Features */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Personalized plans</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-accent">✓</span>
                <span>Adaptive difficulty</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-secondary">✓</span>
                <span>Progress tracking</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Visual Card */}
              <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/30 shadow-cozy backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🍳</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          This Week's Plan
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Beginner • Italian Cuisine
                        </p>
                      </div>
                    </div>

                    {/* Recipe Cards */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                        <span className="text-2xl">🍝</span>
                        <div className="flex-1">
                          <p className="font-medium">Simple Spaghetti</p>
                          <p className="text-sm text-muted-foreground">
                            Easy • 20 min
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs text-primary">✓</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                        <span className="text-2xl">🥗</span>
                        <div className="flex-1">
                          <p className="font-medium">Caesar Salad</p>
                          <p className="text-sm text-muted-foreground">
                            Easy • 15 min
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30"></div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 opacity-60">
                        <span className="text-2xl">🍖</span>
                        <div className="flex-1">
                          <p className="font-medium">Herb Chicken</p>
                          <p className="text-sm text-muted-foreground">
                            Medium • 35 min
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-muted/30 border border-muted">
                          <span className="text-xs text-muted-foreground ml-1">
                            🔒
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Background Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 border-t border-border/20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-primary">ChefPath</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our adaptive cooking system grows with you, making every meal an
              opportunity to learn and improve.
            </p>
          </div>

          {/* Enhanced Feature Cards with Warm Kitchen Colors */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="card-recipe hover:shadow-cozy hover:animate-simmer bg-gradient-to-br from-primary/15 via-card to-primary/25 border-primary/40 shadow-warm backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/25 rounded-full flex items-center justify-center shadow-inner border-2 border-primary/20">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-primary">
                  Personalized Plans
                </h3>
                <p className="text-muted-foreground">
                  Get weekly meal plans tailored to your cuisine preferences and
                  skill level
                </p>
              </CardContent>
            </Card>

            <Card className="card-recipe hover:shadow-cozy hover:animate-simmer bg-gradient-to-br from-accent/15 via-card to-accent/25 border-accent/40 shadow-warm backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-accent/25 rounded-full flex items-center justify-center shadow-inner border-2 border-accent/20">
                  <span className="text-3xl">📈</span>
                </div>
                <h3 className="text-xl font-bold text-accent-foreground">
                  Adaptive Learning
                </h3>
                <p className="text-muted-foreground">
                  Our system adapts to your feedback, making recipes easier or
                  harder as needed
                </p>
              </CardContent>
            </Card>

            <Card className="card-recipe hover:shadow-cozy hover:animate-simmer bg-gradient-to-br from-secondary/15 via-card to-secondary/25 border-secondary/40 shadow-warm backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-secondary/25 rounded-full flex items-center justify-center shadow-inner border-2 border-secondary/20">
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold text-secondary-foreground">
                  Track Progress
                </h3>
                <p className="text-muted-foreground">
                  See your cooking journey progress and unlock new challenges
                  week by week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced CTA Section with More Color */}
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl blur-3xl"></div>

            <Card className="relative bg-gradient-to-br from-primary/8 via-background to-accent/12 border-2 border-primary/30 shadow-cozy backdrop-blur-sm">
              <CardContent className="p-12 text-center space-y-8">
                {/* Main CTA */}
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold text-primary">
                    Ready to Start Cooking?
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Join thousands of home cooks who've transformed their
                    kitchen skills with ChefPath
                  </p>
                </div>

                {/* Giant CTA Button */}
                <div className="space-y-4">
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className="h-20 px-16 text-2xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary hover:to-accent/90 text-primary-foreground shadow-cozy hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-pulse hover:animate-none border-2 border-primary/30"
                  >
                    <span className="flex items-center gap-4">
                      <span className="text-3xl animate-bounce">🚀</span>
                      <span>Start Your Cooking Journey</span>
                      <span
                        className="text-3xl animate-bounce"
                        style={{ animationDelay: "0.5s" }}
                      >
                        ✨
                      </span>
                    </span>
                  </Button>

                  <p className="text-sm text-muted-foreground font-medium">
                    ⏱️ Takes less than 2 minutes to set up your personalized
                    experience
                  </p>
                </div>

                {/* Enhanced Trust indicators with more color */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-warm">
                    <span className="text-2xl">⚡</span>
                    <span className="font-semibold text-primary">
                      Quick Setup
                    </span>
                    <span className="text-xs text-muted-foreground">
                      No complicated forms
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 shadow-warm">
                    <span className="text-2xl">🎯</span>
                    <span className="font-semibold text-accent-foreground">
                      Personalized
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Adapts to your skill level
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 shadow-warm">
                    <span className="text-2xl">📱</span>
                    <span className="font-semibold text-secondary-foreground">
                      Mobile Friendly
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Cook anywhere, anytime
                    </span>
                  </div>
                </div>

                {/* Launch message */}
                <div className="pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    🌟 <span className="font-semibold">New!</span> Start your
                    personalized cooking journey today
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 border-t border-border/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl space-y-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center shadow-warm">
                  <span className="text-xl">🍳</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ChefPath
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your personal cooking mentor that adapts to your skill level and
                helps you master the kitchen one recipe at a time.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Quick Links</h3>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
                <span className="hover:text-primary transition-colors cursor-pointer">
                  How it Works
                </span>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Recipe Library
                </span>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Getting Started
                </span>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Privacy Policy
                </span>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 ChefPath. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span>All systems operational</span>
              </div>
              <div className="border-l border-border/30 pl-6">
                <span>Built with Next.js</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration for footer */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-30"></div>
      </footer>
    </div>
  );
}
