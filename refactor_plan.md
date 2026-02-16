# Recipe Status Toggle Implementation Plan

## Overview

Add functionality to allow users to mark completed recipes as incomplete (and vice versa) to provide flexibility in tracking recipe progress.

## Current State

- `FeedbackCreate` schema only supports marking recipes as completed
- `process_feedback()` method hardcodes status="completed" with no reversal logic
- No existing endpoint supports bidirectional status changes
- Once a recipe is marked completed, it cannot be unmarked

## Backend Changes

### 1. Add UpdateRecipeStatus Schema

**File:** `app/schemas/__init__.py`  
**Location:** After line 178 (after `FeedbackCreate` class)

```python
class UpdateRecipeStatus(BaseModel):
    status: Literal["not_started", "completed"]
```

### 2. Update Imports

**File:** `app/routers/feedback.py`  
**Action:** Add `UpdateRecipeStatus` to the imports from `app.schemas`

```python
from app.schemas import (
    FeedbackCreate,
    FeedbackResponse,
    UserRecipeProgressResponse,
    UpdateRecipeStatus  # Add this
)
```

### 3. Add Status Update Endpoint

**File:** `app/routers/feedback.py`  
**Location:** Add new endpoint function

```python
@router.patch(
    "/progress/{user_id}/recipe/{recipe_id}/week/{week_number}",
    response_model=UserRecipeProgressResponse
)
def update_recipe_status(
    user_id: str,
    recipe_id: str,
    week_number: int,
    status_update: UpdateRecipeStatus,
    db: Session = Depends(get_db)
):
    """
    Update the status of a recipe (mark as incomplete/complete).

    This allows users to toggle between completed and not_started states.
    When marking as incomplete, feedback and rating are cleared.
    """
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify recipe exists
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Find or create progress entry
    progress = db.query(UserRecipeProgress).filter(
        UserRecipeProgress.user_id == user_id,
        UserRecipeProgress.recipe_id == recipe_id,
        UserRecipeProgress.week_number == week_number
    ).first()

    if not progress:
        # Create new progress entry
        progress = UserRecipeProgress(
            user_id=user_id,
            recipe_id=recipe_id,
            week_number=week_number,
            status=status_update.status
        )
        db.add(progress)
    else:
        # Update existing progress
        progress.status = status_update.status

        if status_update.status == "completed":
            progress.completed_at = datetime.utcnow()
        elif status_update.status == "not_started":
            # Clear completion data when marking as incomplete
            progress.completed_at = None
            progress.feedback = None
            progress.rating = None

    db.commit()
    db.refresh(progress)

    return UserRecipeProgressResponse(
        id=progress.id,
        user_id=progress.user_id,
        recipe_id=progress.recipe_id,
        week_number=progress.week_number,
        status=progress.status,
        completed_at=progress.completed_at,
        feedback=progress.feedback,
        rating=progress.rating
    )
```

## Frontend Integration

### API Usage

```typescript
// Mark recipe as incomplete
const markAsIncomplete = async (
  userId: string,
  recipeId: string,
  weekNumber: number
) => {
  const response = await fetch(
    `/api/progress/${userId}/recipe/${recipeId}/week/${weekNumber}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "not_started" }),
    }
  );
  return response.json();
};

// Mark recipe as complete (alternative to feedback endpoint)
const markAsComplete = async (
  userId: string,
  recipeId: string,
  weekNumber: number
) => {
  const response = await fetch(
    `/api/progress/${userId}/recipe/${recipeId}/week/${weekNumber}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    }
  );
  return response.json();
};
```

### UI Integration

1. **Completed Recipe Card:**
   - Add "Mark as Incomplete" button next to existing actions
   - On click, call `markAsIncomplete()`
   - Update local state to reflect new status
   - Re-enable swap button (since recipe is no longer completed)

2. **State Management:**
   - After status change, update recipe card UI
   - Clear completion timestamp display
   - Clear feedback/rating display (if showing)
   - Show appropriate action buttons based on new status

3. **User Feedback:**
   - Show toast notification: "Recipe marked as incomplete"
   - Animate state transition for better UX

## Testing Steps

### Backend Testing

1. **Mark recipe as complete:**

   ```bash
   curl -X PATCH \
     http://localhost:8000/progress/{user_id}/recipe/{recipe_id}/week/1 \
     -H "Content-Type: application/json" \
     -d '{"status": "completed"}'
   ```

2. **Mark recipe as incomplete:**

   ```bash
   curl -X PATCH \
     http://localhost:8000/progress/{user_id}/recipe/{recipe_id}/week/1 \
     -H "Content-Type: application/json" \
     -d '{"status": "not_started"}'
   ```

3. **Verify data clearing:**
   - Mark recipe complete with feedback
   - Mark as incomplete
   - Verify completed_at, feedback, rating are all NULL

### Frontend Testing

1. Complete a recipe through normal feedback flow
2. Verify "Mark as Incomplete" button appears
3. Click button and verify:
   - Status changes to "not_started"
   - Completion date disappears
   - Swap button becomes enabled
   - No errors in console

## Edge Cases

### Backend Validation

- ✅ Non-existent user → 404 error
- ✅ Non-existent recipe → 404 error
- ✅ Invalid status value → Pydantic validation error (422)
- ✅ First-time status update → Creates new progress entry
- ✅ Toggling status multiple times → Updates existing entry

### Frontend Handling

- Loading state during API call
- Error handling for failed requests
- Optimistic UI updates with rollback on error
- Disable button during status change to prevent double-clicks

## Implementation Priority

1. Apply backend changes (schema + endpoint)
2. Test backend with curl/Postman
3. Implement frontend UI changes
4. Test end-to-end flow
5. Deploy to staging for user testing

## Benefits

- Provides flexibility for users who accidentally mark recipes complete
- Allows users to re-cook recipes and track them again
- Consistent with principle of reversible actions in UX design
- Minimal code changes with clear separation of concerns
