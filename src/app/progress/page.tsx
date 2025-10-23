"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFeedback, useUser, useWeeklyPlans } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProgressPage() {
  const { user, isLoading } = useUser();
  const { userProgress, loadUserProgress } = useFeedback();
  const { weeklyPlans } = useWeeklyPlans();
  const router = useRouter();
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/onboarding");
    } else if (user) {
      loadUserProgress(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

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
              <div className="w-full h-6 bg-[hsl(var(--sage))]/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[hsl(var(--paprika))] transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-lg bg-[hsl(var(--sage))]/10">
                <div className="text-lg font-bold text-primary">
                  {userProgress.completed_recipes}
                </div>
                <div className="text-muted-foreground">Completed Recipes</div>
              </div>
              <div className="p-4 rounded-lg bg-[hsl(var(--turmeric))]/10">
                <div className="text-lg font-bold text-primary">
                  Week {userProgress.current_week}
                </div>
                <div className="text-muted-foreground">Current Week</div>
              </div>
              <div className="p-4 rounded-lg bg-[hsl(var(--paprika))]/10 col-span-2">
                <div className="text-lg font-bold text-primary">
                  {userProgress.skill_progression}
                </div>
                <div className="text-muted-foreground">Skill Progression</div>
              </div>
            </div>

            {/* Completed Weeks */}
            <div>
              <div className="font-semibold text-primary mb-2">
                Completed Weeks
              </div>
              <div className="flex flex-wrap gap-2">
                {completedWeeks.length > 0 ? (
                  completedWeeks.map((plan) => (
                    <span
                      key={plan.week_number}
                      className="px-3 py-1 rounded-full bg-[hsl(var(--sage))]/30 text-primary text-sm border border-[hsl(var(--sage))]"
                    >
                      Week {plan.week_number}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">
                    No weeks completed yet.
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
