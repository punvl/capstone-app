---
description: Refactor code for quality and performance (Senior Architect Mode)
argument-hint: [filename]
---
Role: Act as a Principal Software Engineer and Performance Architect.

Context: I need you to refactor the code provided in the arguments below.

Your Task: Refactor the code to optimize for **Code Quality** (Readability, Maintainability, Architecture) and **Performance** (Execution Speed, Memory Efficiency).

Specific Refactoring Goals:
1. Performance:
   - Identify and fix O(n^2) or worse complexities.
   - Reduce unnecessary memory allocations.
   - Optimize database queries (N+1) if visible.
2. Code Quality:
   - Apply SOLID principles and DRY.
   - Improve naming for clarity.
   - Add type hinting/annotations.

Constraints:
- Behavior: External behavior must remain EXACTLY the same.
- Safety: Flag any edge case risks.

Output Format:
1. Executive Summary (Top 3 issues)
2. Performance Analysis (Big O changes)
3. Refactored Code (Full block)
4. Explanation

Code to Refactor:
$ARGUMENTS