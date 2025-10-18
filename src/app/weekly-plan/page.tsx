"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

import { useUser, useWeeklyPlans } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WeeklyPlanPage() {
  const { user, isLoading: userLoading } = useUser();
  const {
    weeklyPlans,
    currentWeek,
    isLoading: plansLoading,
    error,
    loadWeeklyPlans,
    getCurrentWeekPlan,
  } = useWeeklyPlans();
  const router = useRouter();

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/onboarding");
    } else if (user) {
      loadWeeklyPlans(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  if (userLoading || plansLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading your weekly plan...
          </p>
        </div>
      </div>
    );
  }

  const currentPlan = getCurrentWeekPlan();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-cozy">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Your Weekly Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-600 text-center mb-4">{error}</div>
          )}
          {currentPlan ? (
            <div className="py-4">
              <div className="mb-6 text-center text-lg font-semibold text-primary">
                Week {currentPlan.week_number}: {currentPlan.recipes.length}{" "}
                recipes planned
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {currentPlan.recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={`/recipe/${recipe.id}`}
                    className="block group"
                  >
                    <Card className="overflow-hidden group-hover:shadow-lg transition-shadow">
                      {recipe.image_url && (
                        <img
                          src={recipe.image_url}
                          alt={recipe.name}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <CardContent className="p-4">
                        <div className="font-bold text-lg text-primary mb-1 group-hover:underline">
                          {recipe.name}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {recipe.cuisine}
                        </div>
                        {/* Add more recipe info here as needed */}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-8">
              No meal plan found for this week.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
