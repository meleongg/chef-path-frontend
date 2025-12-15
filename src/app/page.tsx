"use client";

import LandingFooter from "@/components/LandingFooter";
import LandingNavbar from "@/components/LandingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks";
import {
  Check,
  ChefHat,
  Clock,
  FileText,
  Rocket,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/50 to-[hsl(var(--turmeric))]/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--paprika))_0%,transparent_25%),radial-gradient(circle_at_70%_80%,hsl(var(--turmeric))_0%,transparent_25%),radial-gradient(circle_at_40%_60%,hsl(var(--sage))_0%,transparent_20%)] opacity-8"></div>

      {/* Navigation Bar */}
      <LandingNavbar />

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-800">
                Your Personal{" "}
                <span className="bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-600 bg-clip-text text-transparent">
                  Cooking Mentor
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed flex items-center gap-2">
                Get personalized weekly meal plans that adapt to your skill
                level, preferences, and feedback. Learn to cook at your own
                pace!
                <ChefHat className="w-6 h-6 inline" />
              </p>
            </div>

            {/* Primary CTA */}
            <div className="space-y-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-600 hover:from-orange-600 hover:to-[hsl(var(--paprika))] text-white shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <span className="flex items-center gap-3">
                  <Rocket className="w-5 h-5" />
                  Start Your Cooking Journey
                </span>
              </Button>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                Takes less than 2 minutes • No credit card required
              </p>
            </div>

            {/* Quick Features */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Check className="w-5 h-5 text-[hsl(var(--paprika))]" />
                <span className="text-gray-700">Personalized plans</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Check className="w-5 h-5 text-[hsl(var(--turmeric))]" />
                <span className="text-gray-700">Adaptive difficulty</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Check className="w-5 h-5 text-[hsl(var(--sage))]" />
                <span className="text-gray-700">Progress tracking</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Visual Card */}
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-[hsl(var(--paprika))]/40 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--paprika))]/20 to-orange-200/40 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-[hsl(var(--paprika))]" />
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
                        <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            ✓
                          </span>
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
                        <div className="w-6 h-6 rounded-full bg-[hsl(var(--turmeric))]/30 border-2 border-[hsl(var(--turmeric))]"></div>
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
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-[hsl(var(--turmeric))]/30 to-orange-300/30 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-[hsl(var(--paprika))]/30 to-amber-300/30 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 border-t border-border/20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-600 bg-clip-text text-transparent">
                ChefPath
              </span>
              ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our adaptive cooking system grows with you, making every meal an
              opportunity to learn and improve.
            </p>
          </div>

          {/* Enhanced Feature Cards with Warm Kitchen Colors */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 border-2 border-[hsl(var(--paprika))]/30 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[hsl(var(--paprika))]/20 to-orange-200 rounded-full flex items-center justify-center shadow-lg border-2 border-[hsl(var(--paprika))]/30">
                  <FileText className="w-8 h-8 text-[hsl(var(--paprika))]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(var(--paprika))]">
                  Personalized Plans
                </h3>
                <p className="text-gray-600">
                  Get weekly meal plans tailored to your cuisine preferences and
                  skill level
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 via-white to-amber-50/50 border-2 border-[hsl(var(--turmeric))]/40 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[hsl(var(--turmeric))]/30 to-amber-200 rounded-full flex items-center justify-center shadow-lg border-2 border-[hsl(var(--turmeric))]/40">
                  <TrendingUp className="w-8 h-8 text-amber-700" />
                </div>
                <h3 className="text-xl font-bold text-amber-700">
                  Adaptive Learning
                </h3>
                <p className="text-gray-600">
                  Our system adapts to your feedback, making recipes easier or
                  harder as needed
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 via-white to-emerald-50/50 border-2 border-[hsl(var(--sage))]/40 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[hsl(var(--sage))]/30 to-green-200 rounded-full flex items-center justify-center shadow-lg border-2 border-[hsl(var(--sage))]/40">
                  <Trophy className="w-8 h-8 text-[hsl(var(--sage))]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(var(--sage))]">
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
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--paprika))]/20 via-[hsl(var(--turmeric))]/20 to-orange-300/20 rounded-3xl blur-3xl"></div>

            <Card className="relative bg-gradient-to-br from-amber-50/80 via-white to-orange-50/80 border-2 border-[hsl(var(--paprika))]/40 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-12 text-center space-y-8">
                {/* Main CTA */}
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-600 bg-clip-text text-transparent">
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
                    className="h-20 px-16 text-2xl font-bold bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-600 hover:from-orange-600 hover:to-[hsl(var(--paprika))] text-white shadow-2xl hover:shadow-xl transition-all duration-500 transform hover:scale-105 animate-pulse hover:animate-none border-2 border-orange-700/30"
                  >
                    <span className="flex items-center gap-4">
                      <Rocket className="w-6 h-6" />
                      <span>Start Your Cooking Journey</span>
                      <Sparkles className="w-6 h-6" />
                    </span>
                  </Button>

                  <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Takes less than 2 minutes to set up your personalized
                    experience
                  </p>
                </div>

                {/* Enhanced Trust indicators with more color */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-[hsl(var(--paprika))]/15 to-orange-100/50 border-2 border-[hsl(var(--paprika))]/30 shadow-lg">
                    <Zap className="w-6 h-6 text-[hsl(var(--paprika))]" />
                    <span className="font-semibold text-[hsl(var(--paprika))]">
                      Quick Setup
                    </span>
                    <span className="text-xs text-gray-600">
                      No complicated forms
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-[hsl(var(--turmeric))]/15 to-amber-100/50 border-2 border-[hsl(var(--turmeric))]/40 shadow-lg">
                    <Target className="w-6 h-6 text-amber-700" />
                    <span className="font-semibold text-amber-700">
                      Personalized
                    </span>
                    <span className="text-xs text-gray-600">
                      Adapts to your skill level
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-br from-[hsl(var(--sage))]/15 to-green-100/50 border-2 border-[hsl(var(--sage))]/40 shadow-lg">
                    <Smartphone className="w-6 h-6 text-[hsl(var(--sage))]" />
                    <span className="font-semibold text-[hsl(var(--sage))]">
                      Mobile Friendly
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Cook anywhere, anytime
                    </span>
                  </div>
                </div>

                {/* Launch message */}
                <div className="pt-6 border-t border-border/50">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold">New!</span> Start your
                    personalized cooking journey today
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
