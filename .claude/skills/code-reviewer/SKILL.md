---
name: code-reviewer
description: Automatically review code for quality, performance, and security issues. Use when writing or modifying code, or when explicitly asked to review code.
allowed-tools: Read, Grep, Glob
model: sonnet
---

# Code Reviewer Skill

Automatically review code changes for quality, performance, and security.

## When to Use This Skill

Use this skill when:
- Writing new code
- Modifying existing code
- User asks "review this code"
- User asks "is this good?"
- Before committing changes

## What This Skill Does

### 1. Code Quality Review

Check for:
- **Type Safety**: No `any` types, proper TypeScript usage
- **Naming**: Descriptive variable/function names
- **Function Length**: Functions under 30 lines
- **Complexity**: Cyclomatic complexity under 10
- **DRY Violations**: Repeated code patterns
- **Error Handling**: Try-catch in async functions
- **SOLID Principles**: Single responsibility, etc.

### 2. Performance Review

Check for:
- **Algorithm Complexity**: O(n²) or worse patterns
- **Database Queries**: N+1 query problems
- **React Re-renders**: Missing memoization
- **Memory Leaks**: Missing cleanup in useEffect
- **Bundle Size**: Heavy imports without code splitting
- **Caching**: Missing caching opportunities

### 3. Security Review

Check for:
- **Input Validation**: Missing validation on user input
- **SQL Injection**: Unparameterized queries
- **XSS Vulnerabilities**: Unescaped HTML output
- **Authentication**: Missing auth checks
- **Secrets Exposure**: Hardcoded credentials
- **CORS Issues**: Overly permissive CORS

## Output Format

Provide feedback in this format:

```markdown
## Code Review: [filename]

### ✅ Strengths
- Well-structured functions
- Good type safety

### 🔴 Critical Issues (Must Fix)
1. **Line 45**: SQL injection vulnerability
   - Issue: User input directly in query
   - Fix: Use parameterized queries
   ```typescript
   // Current
   const query = `SELECT * FROM users WHERE id = ${userId}`;

   // Should be
   const user = await userRepo.findOne({ where: { id: userId } });
   ```

2. **Line 78**: Missing authentication check
   - Issue: Endpoint accessible without auth
   - Fix: Add authentication middleware

### ⚠️ Warnings (Should Fix)
1. **Line 120**: Function too long (45 lines)
   - Recommendation: Extract helper functions

2. **Line 156**: O(n²) nested loop
   - Recommendation: Use hashmap for O(n) lookup

### 💡 Suggestions (Consider)
1. **Line 89**: Could use memoization
   - Benefit: Avoid recalculating on every render

### 📊 Metrics
- Functions reviewed: 8
- Critical issues: 2
- Warnings: 2
- Suggestions: 1
- Complexity: 7.5 avg (✅ under 10)
```

## Review Checklist

For each file, verify:

### TypeScript Files (.ts, .tsx)
- [ ] No `any` types
- [ ] Interfaces defined for complex objects
- [ ] Proper null/undefined handling
- [ ] Return types specified on functions
- [ ] Enums used for constants

### Backend Files (services, controllers)
- [ ] Error handling in all async functions
- [ ] Input validation before business logic
- [ ] Database queries use indexes
- [ ] Transactions for multi-step writes
- [ ] Authentication checks on protected routes
- [ ] Rate limiting on public endpoints

### Frontend Files (components, hooks)
- [ ] Functional components only
- [ ] Proper dependency arrays in hooks
- [ ] Memoization for expensive computations
- [ ] Cleanup in useEffect
- [ ] Error boundaries for error handling
- [ ] Loading states for async operations

### Database Files (models, migrations)
- [ ] Indexes on foreign keys
- [ ] Proper constraints
- [ ] Migration has up and down
- [ ] No breaking changes without migration

## Severity Levels

### 🔴 Critical (Block Commit)
- Security vulnerabilities
- Data loss risks
- Breaking changes without migration
- Missing authentication/authorization
- Performance issues causing timeouts

### ⚠️ Warning (Fix Soon)
- Code quality issues
- Minor performance issues
- Missing error handling
- Long functions
- High complexity

### 💡 Suggestion (Nice to Have)
- Refactoring opportunities
- Better naming
- Additional comments
- Optimization opportunities

## Integration with Rules

This skill automatically enforces:
- [code-quality.md](../../rules/code-quality.md) - All quality standards
- [performance.md](../../rules/performance.md) - All performance standards

## Example Review

### Input
```typescript
async function getSessions(userId) {
  const sessions = await db.query('SELECT * FROM sessions WHERE user_id = ' + userId);
  return sessions;
}
```

### Output
```markdown
## Code Review: sessionService.ts

### 🔴 Critical Issues (Must Fix)

1. **Line 2**: SQL Injection Vulnerability
   - Issue: User input concatenated directly into SQL query
   - Severity: CRITICAL - Could expose entire database
   - Fix:
   ```typescript
   async function getSessions(userId: string): Promise<Session[]> {
     return await sessionRepo.find({ where: { userId } });
   }
   ```

2. **Line 1**: Missing type annotations
   - Issue: Parameter and return type not specified
   - Fix: Add `userId: string` and `: Promise<Session[]>`

3. **Line 2**: Using raw SQL instead of ORM
   - Issue: Bypasses TypeORM safety features
   - Fix: Use TypeORM repository pattern

### ⚠️ Warnings

1. **Line 2**: SELECT * anti-pattern
   - Issue: Fetching all columns when only some needed
   - Fix: Specify columns or use TypeORM select

### Recommendation
Rewrite using TypeORM repository pattern with proper types.
```
