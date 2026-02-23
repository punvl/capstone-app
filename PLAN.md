# Plan: Fix Coordinate Unit Display Bug in Session Details

## Problem Summary

The session details page displays **incorrect values** for Target and Landing coordinates when viewing template-based sessions. The values are wrong, not just the units.

## Investigation Findings

### Backend Data Flow (broker.service.ts)

```typescript
// Lines 122-127: Template coordinates are in CM, converted to METERS for storage
targetPosition = {
  x: templateTarget.dot.x / 100,  // 46cm → 0.46m
  y: templateTarget.dot.y / 100,  // 670cm → 6.70m
};

// Lines 136-139: CV landing positions are in CM, converted to METERS for storage
const landingInMeters = {
  x: landingPosition.x / 100,  // e.g., 144cm → 1.44m
  y: landingPosition.y / 100,  // e.g., 382cm → 3.82m
};

// Lines 147-155: STORED IN DATABASE AS METERS
const shot = await shotService.createShot({
  landingPositionX: landingInMeters.x,  // Meters
  landingPositionY: landingInMeters.y,  // Meters
  targetPositionX: targetPosition.x,     // Meters
  targetPositionY: targetPosition.y,     // Meters
  ...
});
```

**Key Finding**: The database stores ALL positions in **meters**, regardless of whether a template was used.

### Frontend Display Logic (SessionDetail.tsx, lines 380-388)

```typescript
// CURRENT (INCORRECT) LOGIC:
session.template_id
  ? `(${Number(shot.target_position_x).toFixed(0)}cm, ...)`  // Shows 0.46 as "0cm"
  : `(${Number(shot.target_position_x).toFixed(2)}m, ...)`   // Correct for m
```

**The Bug**: When template_id exists, the code:
- Displays the raw database value (which is in meters)
- Labels it as "cm"
- Result: `0.46m` displays as `0cm` instead of `46cm`

## Example of the Bug

| Template Target | Stored Value | Current Display | Correct Display |
|-----------------|--------------|-----------------|-----------------|
| 46cm            | 0.46m        | 0cm             | 46cm            |
| 526cm           | 5.26m        | 5cm             | 526cm           |
| 670cm           | 6.70m        | 7cm             | 670cm           |

## Solution

**Multiply by 100** when displaying cm for template-based sessions to convert meters back to centimeters.

### Code Changes

**File**: `badminton-frontend/src/components/SessionDetail.tsx`

**Line 381** - Target position (convert meters to cm):
```typescript
// Before (WRONG):
`(${Number(shot.target_position_x).toFixed(0)}cm, ${Number(shot.target_position_y).toFixed(0)}cm)`

// After (CORRECT):
`(${(Number(shot.target_position_x) * 100).toFixed(0)}cm, ${(Number(shot.target_position_y) * 100).toFixed(0)}cm)`
```

**Line 387** - Landing position (convert meters to cm):
```typescript
// Before (WRONG):
`(${Number(shot.landing_position_x).toFixed(0)}cm, ${Number(shot.landing_position_y).toFixed(0)}cm)`

// After (CORRECT):
`(${(Number(shot.landing_position_x) * 100).toFixed(0)}cm, ${(Number(shot.landing_position_y) * 100).toFixed(0)}cm)`
```

## Verification

After the fix:
| Stored Value | Display (template session) | Display (non-template) |
|--------------|---------------------------|------------------------|
| 0.46m        | 46cm ✓                    | 0.46m ✓                |
| 5.26m        | 526cm ✓                   | 5.26m ✓                |
| 1.44m        | 144cm ✓                   | 1.44m ✓                |

## Testing Plan

1. Start a new training session with a template
2. Let some shots be recorded
3. Stop the session
4. Navigate to Session Details page
5. Verify Target and Landing coordinates show realistic cm values (e.g., 46cm, 526cm)
6. Verify the coordinates match the template's defined positions

## Impact Assessment

- **Scope**: Frontend only, 2 lines changed
- **Risk**: Low - isolated display logic
- **Breaking changes**: None
- **Backward compatibility**: Maintained for non-template sessions
