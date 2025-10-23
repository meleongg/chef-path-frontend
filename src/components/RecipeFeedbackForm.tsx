"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFeedback, useUser } from "@/hooks";
import { useEffect, useState } from "react";

interface RecipeFeedbackFormProps {
  recipeId: number;
  weekNumber: number;
}

export default function RecipeFeedbackForm({
  recipeId,
  weekNumber,
}: RecipeFeedbackFormProps) {
  const { submitFeedback, isSubmitting, error: feedbackError } = useFeedback();
  const { user } = useUser();
  const [feedback, setFeedback] = useState("");
  const [feedbackSelectError, setFeedbackSelectError] = useState<string | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        const closeBtn = document.querySelector('[data-slot="dialog-close"]');
        if (closeBtn) (closeBtn as HTMLElement).click();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setFeedbackSelectError(null);
    if (!user) return;
    // Input validation for feedback select
    if (!feedback) {
      setFeedbackSelectError(
        "Please select a feedback option before submitting."
      );
      return;
    }
    const ok = await submitFeedback({
      user_id: user.id,
      recipe_id: recipeId,
      week_number: weekNumber,
      feedback,
    });
    if (ok) {
      setSuccess(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-8 flex flex-col gap-6 relative">
      <DialogTitle className="mb-1">Recipe Feedback</DialogTitle>
      <DialogClose className="absolute top-6 right-6" />
      {success ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-green-600 font-medium text-lg">
            Thank you for your feedback!
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogDescription className="mb-4">
            Let us know how this recipe went for you!
          </DialogDescription>
          <Label htmlFor="feedback-select">How was this recipe?</Label>
          <Select
            value={feedback}
            onValueChange={(val) => {
              setFeedback(val);
              setFeedbackSelectError(null);
            }}
            required
          >
            <SelectTrigger
              id="feedback-select"
              className={`h-12 text-base w-full ${
                feedbackSelectError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              aria-invalid={!!feedbackSelectError}
            >
              <SelectValue placeholder="Select feedback" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={5}
              className="z-[9999] max-h-[200px] overflow-y-auto min-w-[var(--radix-select-trigger-width)] bg-background border border-border shadow-lg backdrop-blur-none"
              style={{ backgroundColor: "hsl(var(--background))", opacity: 1 }}
            >
              <SelectItem
                value="too_easy"
                className="cursor-pointer border-b border-border/50"
              >
                Too Easy
              </SelectItem>
              <SelectItem
                value="just_right"
                className="cursor-pointer border-b border-border/50"
              >
                Just Right
              </SelectItem>
              <SelectItem value="too_hard" className="cursor-pointer">
                Too Hard
              </SelectItem>
            </SelectContent>
          </Select>
          {feedbackSelectError && (
            <div className="text-xs text-red-600 mt-1">
              {feedbackSelectError}
            </div>
          )}
          <Label htmlFor="notes-textarea">Additional Notes (optional)</Label>
          <Textarea
            id="notes-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Share any thoughts or suggestions..."
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[hsl(var(--sage))] text-primary font-semibold border border-[hsl(var(--paprika))] shadow transition-colors duration-200 hover:bg-[hsl(var(--sage))]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--paprika))]"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
          {feedbackError && (
            <div className="text-red-600 font-medium">{feedbackError}</div>
          )}
        </form>
      )}
    </div>
  );
}
