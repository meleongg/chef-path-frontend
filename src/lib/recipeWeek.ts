import { ReadonlyURLSearchParams } from "next/navigation";

/**
 * Resolve week number for recipe routes: ?week= query first, then app context.
 */
export function resolveRecipeWeek(
  searchParams: ReadonlyURLSearchParams | null,
  currentWeek: number
): number {
  const raw = searchParams?.get("week");
  if (raw != null && raw !== "") {
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  if (currentWeek > 0) {
    return currentWeek;
  }
  return 1;
}
