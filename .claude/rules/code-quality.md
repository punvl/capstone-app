---
name: code-quality-standards
---

# Code Quality Standards

You must ALWAYS prioritize code quality and maintainability.

## General Principles

### SOLID Principles
- **Single Responsibility**: Each class/function does one thing well
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable
- **Interface Segregation**: Many specific interfaces > one general
- **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)
- Extract repeated logic into reusable functions
- Create utility functions for common patterns
- Use TypeScript generics for type reusability

### Clean Code
- **Naming**: Use descriptive, searchable names
  - Functions: `calculateShotAccuracy()` not `calc()`
  - Variables: `trainingSession` not `ts`
  - Classes: `TrainingSessionService` not `TSS`
- **Function Size**: Keep functions under 20 lines when possible
- **Complexity**: Max cyclomatic complexity of 10
- **Comments**: Explain WHY, not WHAT (code should be self-documenting)

## TypeScript Standards

### Type Safety
- **NO `any` types** - Use `unknown` and type guards instead
- Always define interfaces for complex objects
- Use union types for restricted values
- Prefer `const` over `let`, never use `var`

### Type Definitions
```typescript
// ✅ GOOD
interface Shot {
  id: string;
  sessionId: string;
  accuracy: number;
  timestamp: Date;
}

// ❌ BAD
const shot: any = {...};
```

### Null Safety
- Use optional chaining: `session?.athlete?.name`
- Use nullish coalescing: `value ?? defaultValue`
- Never use `!` non-null assertion without validation

## Backend (Express.js) Standards

### Error Handling
- **ALWAYS** use try-catch in async functions
- Use custom `AppError` class for consistent errors
- Return proper HTTP status codes
- Never expose stack traces in production

```typescript
// ✅ GOOD
try {
  const session = await sessionService.findById(id);
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  return res.json(session);
} catch (error) {
  next(error); // Handled by error middleware
}
```

### Database Queries
- **ALWAYS** use TypeORM query builders or repositories
- Use transactions for multi-step writes
- Add indexes for foreign keys and frequently queried fields
- Use eager loading to prevent N+1 queries
- Validate input before database operations

### Validation
- Validate ALL user input at the controller level
- Use express-validator or joi for validation
- Sanitize strings to prevent injection
- Check authentication/authorization before business logic

## Frontend (React) Standards

### Component Structure
- Functional components with hooks only (no class components)
- Keep components under 200 lines
- Extract complex logic into custom hooks
- One component per file

### State Management
- Use Context API for global state (Auth, Training)
- Use `useState` for local component state
- Use `useMemo` for expensive computations
- Use `useCallback` for function references in dependencies

### React Best Practices
```typescript
// ✅ GOOD - Memoized expensive computation
const sortedShots = useMemo(() => {
  return shots.sort((a, b) => a.shotNumber - b.shotNumber);
}, [shots]);

// ❌ BAD - Sorts on every render
const sortedShots = shots.sort((a, b) => a.shotNumber - b.shotNumber);
```

### Error Boundaries
- Wrap major sections in error boundaries
- Show user-friendly error messages
- Log errors for debugging

## Performance Requirements

### Backend Performance
- API response times < 200ms for reads
- Use Redis caching for frequently accessed data
- Implement pagination for list endpoints
- Use connection pooling for database
- Add request rate limiting

### Frontend Performance
- Code splitting for routes
- Lazy load heavy components
- Debounce search inputs
- Throttle scroll/resize handlers
- Optimize images (WebP, lazy loading)

### Database Performance
- Index foreign keys: `athlete_id`, `session_id`, `coach_id`
- Avoid N+1 queries (use joins or eager loading)
- Use database-level constraints
- Monitor query execution time

## Security Requirements

### Authentication
- Use JWT with short expiration (15 minutes)
- Store refresh tokens in HttpOnly cookies
- Validate tokens on every protected route
- Hash passwords with bcrypt (12 rounds minimum)

### Input Validation
- Sanitize all user input
- Validate data types and ranges
- Prevent SQL injection (use parameterized queries)
- Prevent XSS (escape HTML output)
- Prevent CSRF (use tokens)

### Environment Variables
- **NEVER** commit secrets to git
- Use `.env` files (gitignored)
- Validate required env vars on startup
- Use different secrets for dev/prod

## Testing Requirements

### Test Coverage
- Minimum 70% code coverage
- All critical paths must have tests
- Test edge cases and error scenarios

### Test Types
- **Unit tests**: Individual functions/methods
- **Integration tests**: API endpoints with database
- **Component tests**: React components with RTL
- **E2E tests**: Critical user flows

## Code Review Checklist

Before any commit, verify:
- [ ] No `any` types in TypeScript
- [ ] All async functions have error handling
- [ ] Database queries use proper indexes
- [ ] Input validation on all endpoints
- [ ] No sensitive data in logs
- [ ] Functions are under 20 lines
- [ ] Descriptive variable/function names
- [ ] No repeated code (DRY violations)
- [ ] Performance implications considered
- [ ] Tests added for new features

## When to Refactor

Refactor immediately when you see:
- Functions > 30 lines
- Cyclomatic complexity > 10
- Repeated code (3+ times)
- Unclear variable names
- Missing error handling
- Hardcoded values (should be constants)
- N+1 database queries
- `any` types in TypeScript
