"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useFormValidation, useUser } from "@/hooks";
import { CreateUserRequest } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, Toaster } from "sonner";

import { CUISINE_OPTIONS, SKILL_LEVELS } from "@/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const { createUser, isLoading, error } = useUser();
  const { errors, validateOnboarding, clearErrors } = useFormValidation();

  const [formData, setFormData] = useState<CreateUserRequest>({
    name: "",
    cuisine: "",
    frequency: 3,
    skill_level: "",
    course_duration: 8,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!validateOnboarding(formData)) {
      // Show toast for validation errors
      const errorMessages = [];
      if (errors.name) errorMessages.push(`Name: ${errors.name}`);
      if (errors.cuisine) errorMessages.push(`Cuisine: ${errors.cuisine}`);
      if (errors.skill_level)
        errorMessages.push(`Skill Level: ${errors.skill_level}`);
      if (errors.frequency)
        errorMessages.push(`Frequency: ${errors.frequency}`);
      if (errors.course_duration)
        errorMessages.push(`Duration: ${errors.course_duration}`);

      toast.error("Form Validation Error", {
        description:
          "Please fix the following issues:\n" + errorMessages.join("\n"),
        duration: 6000,
      });
      return;
    }

    try {
      const user = await createUser(formData);
      if (user) {
        toast.success("Welcome to ChefPath! 🍳", {
          description: "Your cooking journey starts now!",
        });
        router.push("/weekly-plan");
      }
    } catch (err) {
      toast.error("Account Creation Failed", {
        description:
          error ||
          "Unable to create your account. Please check your connection and try again.",
        duration: 6000,
      });
    }
  };

  const updateFormData = (
    field: keyof CreateUserRequest,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Toaster position="top-center" expand={true} richColors />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl card-recipe shadow-cozy overflow-visible">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-3xl">👨‍🍳</span>
            </div>
            <CardTitle className="text-3xl font-bold text-primary">
              Welcome to ChefPath!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Your personalized cooking journey starts here. Let's get to know
              you better so we can create the perfect meal plan just for you! 🍳
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  What's your name? <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className={`h-12 text-base ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Cuisine Preference */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  What type of cuisine excites you most?{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.cuisine}
                  onValueChange={(value) => updateFormData("cuisine", value)}
                >
                  <SelectTrigger
                    className={`h-12 text-base ${
                      errors.cuisine
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Choose your favorite cuisine" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    className="z-[9999] max-h-[200px] overflow-y-auto min-w-[var(--radix-select-trigger-width)] bg-background border border-border shadow-lg backdrop-blur-none"
                    style={{
                      backgroundColor: "hsl(var(--background))",
                      opacity: 1,
                    }}
                  >
                    {CUISINE_OPTIONS.map(
                      (cuisine: { value: string; label: string }) => (
                        <SelectItem
                          key={cuisine.value}
                          value={cuisine.value}
                          className="cursor-pointer border-b border-border/50"
                        >
                          {cuisine.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {errors.cuisine && (
                  <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {errors.cuisine}
                  </p>
                )}
              </div>

              {/* Cooking Frequency */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  How many meals would you like to cook per week?{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div
                  className={`px-6 py-4 bg-muted/30 rounded-lg border ${
                    errors.frequency
                      ? "border-red-500 border-2 bg-red-50/50"
                      : "border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Meals per week
                    </span>
                    <span className="text-2xl font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {formData.frequency}
                    </span>
                  </div>
                  <div className="px-2">
                    <Slider
                      min={1}
                      max={7}
                      value={formData.frequency}
                      onValueChange={(value) =>
                        updateFormData("frequency", value)
                      }
                      color="primary"
                      className="mb-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="font-medium">1</span>
                      <span className="font-medium">4</span>
                      <span className="font-medium">7</span>
                    </div>
                  </div>
                </div>
                {errors.frequency && (
                  <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {errors.frequency}
                  </p>
                )}
              </div>

              {/* Skill Level */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  How would you describe your cooking skills?{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.skill_level}
                  onValueChange={(value) =>
                    updateFormData("skill_level", value)
                  }
                >
                  <SelectTrigger
                    className={`h-12 text-base ${
                      errors.skill_level
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select your skill level" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    className="z-[9999] max-h-[200px] overflow-y-auto min-w-[var(--radix-select-trigger-width)] bg-background border border-border shadow-lg backdrop-blur-none"
                    style={{
                      backgroundColor: "hsl(var(--background))",
                      opacity: 1,
                    }}
                  >
                    {SKILL_LEVELS.map(
                      (level: { value: string; label: string }) => (
                        <SelectItem
                          key={level.value}
                          value={level.value}
                          className="cursor-pointer border-b border-border/50"
                        >
                          {level.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                {errors.skill_level && (
                  <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {errors.skill_level}
                  </p>
                )}
              </div>

              {/* Course Duration */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  How many weeks would you like your cooking journey to last?{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div
                  className={`px-6 py-4 bg-muted/30 rounded-lg border ${
                    errors.course_duration
                      ? "border-red-500 bg-red-50/50"
                      : "border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      Course duration
                    </span>
                    <span className="text-2xl font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                      {formData.course_duration} week
                      {formData.course_duration !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="px-2">
                    <Slider
                      min={4}
                      max={16}
                      value={formData.course_duration}
                      onValueChange={(value) =>
                        updateFormData("course_duration", value)
                      }
                      color="accent"
                      className="mb-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="font-medium">4 weeks</span>
                      <span className="font-medium">10 weeks</span>
                      <span className="font-medium">16 weeks</span>
                    </div>
                  </div>
                </div>
                {errors.course_duration && (
                  <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {errors.course_duration}
                  </p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium flex items-center gap-2">
                    <span className="text-red-500">❌</span>
                    <span className="font-semibold">Error:</span>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold btn-cooking"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div>⚡</div>
                    Setting up your kitchen...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>🚀</span>
                    Start My Cooking Journey!
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              <p>✨ We'll create a personalized meal plan just for you!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
