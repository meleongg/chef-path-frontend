"use client";

import AuthGuard from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeedback, useUser, useWeeklyPlans } from "@/hooks";
import Link from "next/link";
import { useEffect } from "react";

export default function ProgressPage() {
  return (
    <AuthGuard requireOnboarding>
      <ProgressPageContent />
    </AuthGuard>
  );
}

function ProgressPageContent() {
  const { user, isLoading } = useUser();
  const { userProgress, loadUserProgress } = useFeedback();
  const { weeklyPlans } = useWeeklyPlans();

  useEffect(() => {
    if (user) {
      loadUserProgress(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (isLoading || !user || !userProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--paprika))]/10 via-[hsl(var(--sage))]/10 to-[hsl(var(--turmeric))]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Progress bar width
  const progressPercent = Math.round(
    (userProgress.completed_recipes / Math.max(userProgress.total_recipes, 1)) *
      100
  );

  // Find completed weeks (unlocked and < current week)
  const completedWeeks = weeklyPlans.filter(
    (plan) => plan.is_unlocked && plan.week_number < userProgress.current_week
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--paprika))]/10 via-[hsl(var(--sage))]/10 to-[hsl(var(--turmeric))]/10">
      <Card className="w-full max-w-2xl shadow-cozy border-2 border-[hsl(var(--paprika))] bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Your Cooking Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* 100% Completion Banner */}
            {progressPercent === 100 && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg shadow-md">
                <div className="text-center space-y-4">
                  <div className="text-3xl">🎉</div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      Week Complete! Amazing Work!
                    </h3>
                    <p className="text-green-700 mb-4">
                      You've completed all recipes for this week. Ready to level up?
                    </p>
                  </div>
                  <Link
                    href="/weekly-plan"
                    className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    Generate Next Week's Plan
                  </Link>
                  <p className="text-sm text-green-600">
                    Use the chat widget to modify your plan if needed
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-muted-foreground">
                  Completion Rate
                </span>
                <span className="font-semibold text-primary">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Stats Grid with Icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🍳</span>
                  <div className="text-3xl font-bold text-blue-700">
                    {userProgress.completed_recipes}
                  </div>
                </div>
                <div className="text-sm font-medium text-blue-600">Completed Recipes</div>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📅</span>
                  <div className="text-3xl font-bold text-purple-700">
                    {userProgress.current_week}
                  </div>
                </div>
                <div className="text-sm font-medium text-purple-600">Current Week</div>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📈</span>
                  <div className="text-xl font-bold text-amber-700 capitalize">
                    {userProgress.skill_progression}
                  </div>
                </div>
                <div className="text-sm font-medium text-amber-600">Skill Progression</div>
              </div>
            </div>

            {/* Completed Weeks */}
            <div>
              <div className="font-semibold text-primary mb-3 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span>Achievement Badges</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {completedWeeks.length > 0 ? (
                  completedWeeks.map((plan) => (
                    <span
                      key={plan.week_number}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-sm font-semibold border-2 border-green-500 shadow-sm flex items-center gap-2"
                    >
                      <span>✓</span>
                      <span>Week {plan.week_number}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Complete your first week to earn achievement badges!
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
