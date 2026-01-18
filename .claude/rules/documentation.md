# Documentation Standards

## CRITICAL: No Auto-Documentation Generation

**NEVER create new documentation files** unless explicitly requested by the user.

### Prohibited Actions
- ❌ Creating new .md files in root directory
- ❌ Creating summary/analysis/report files automatically
- ❌ Writing "completion" or "success" documentation
- ❌ Generating test result files
- ❌ Creating implementation guides unprompted

### Allowed Documentation Actions
- ✅ Update existing CLAUDE.md when significant changes occur
- ✅ Update existing docs/ files if explicitly requested
- ✅ Add inline code comments for complex logic
- ✅ Update README files when features change

## Documentation Structure

### Root Directory
Only these files allowed:
- `README.md` - Project overview and quick links
- `CLAUDE.md` - AI assistant context (auto-updated by pre-commit-guardian)

### docs/ Directory
All detailed documentation goes here:
- `GETTING_STARTED.md` - Setup and installation
- `PROJECT_SUMMARY.md` - Comprehensive project overview
- `TESTING_COMPLETE.md` - All testing documentation consolidated
- `REFACTORING_SUMMARY.md` - Performance optimization details
- `IMPLEMENTATION_GUIDE.md` - Deployment instructions
- `DEMO_GUIDE.md` - Demo walkthrough
- `MOCK_CV_SETUP.md` - Mock CV component setup

### When to Update CLAUDE.md

ONLY update when:
1. Major architecture changes (new services, databases, etc.)
2. New critical features added
3. Tech stack changes (new frameworks, libraries)
4. API endpoint changes (new routes, modified contracts)
5. User explicitly requests update

DO NOT update for:
- Minor bug fixes
- Code refactoring (unless it changes architecture)
- Test additions
- Documentation changes
- Styling updates

### Inline Documentation

Prefer inline comments over separate files:
```typescript
// ✅ GOOD - Inline comment explaining complex logic
const accuracy = Math.sqrt(
  Math.pow(targetX - landingX, 2) + 
  Math.pow(targetY - landingY, 2)
) * 100; // Euclidean distance in cm

// ❌ BAD - Creating "ACCURACY_CALCULATION.md" file
```

### Code Self-Documentation

Write self-documenting code:
```typescript
// ✅ GOOD - Clear function name, no doc needed
function calculateShotAccuracyInCentimeters(
  targetPosition: Position, 
  landingPosition: Position
): number {
  // Implementation
}

// ❌ BAD - Unclear name requiring documentation
function calc(t: any, l: any): number {
  // Creates calc_explanation.md to explain
}
```

## Pre-Commit Guardian Integration

The pre-commit-guardian agent automatically:
- Updates CLAUDE.md with significant changes
- Prevents documentation drift
- No manual documentation needed

Trust the guardian - don't duplicate its work.

## Quick Reference

### User asks: "Document this feature"
**Response:** Add inline comments to the code, update existing docs/ files if relevant.
**DON'T:** Create new "FEATURE_DOCUMENTATION.md" file.

### User asks: "Summarize what we did"
**Response:** Provide summary in chat response.
**DON'T:** Create "TASK_SUMMARY.md" file.

### User asks: "Create a guide for X"
**Response:** Ask where to put it (update existing docs/ file or create new one with specific name).
**DON'T:** Automatically create "X_GUIDE.md" in root.

### After completing tests
**Response:** Update existing TESTING_COMPLETE.md if needed.
**DON'T:** Create TEST_RESULTS_SUMMARY.md, TEST_SUCCESS_FINAL.md, etc.

## Exception: User Explicitly Requests

If user says:
- "Create a document about X"
- "Write a guide for Y"  
- "Generate documentation for Z"

Then:
1. Ask where to put it (docs/ directory preferred)
2. Ask for specific filename
3. Create only that specific file

## Summary

- **Default:** NO new documentation files
- **Updates:** Only CLAUDE.md for major changes (handled by guardian)
- **Details:** Use inline comments and existing docs/ files
- **User request:** Ask for location and filename first

Keep the codebase clean. Let the code speak for itself.
