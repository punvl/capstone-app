# Test Analysis and Fixes Required

**Date:** 2026-01-18
**Current Status:** 16/70+ tests passing (2 middleware test suites only)

---

## Executive Summary

### Current Test Status

| Test Suite | Status | Tests Passing | Tests Failing | Issue Type |
|------------|--------|---------------|---------------|------------|
| Error Middleware | ✅ PASSING | 8/8 | 0 | None |
| Auth Middleware | ✅ PASSING | 8/8 | 0 | None |
| Auth Service | ❌ FAILING | 0/8 | 8 | Repository initialization |
| Athlete Service | ❌ FAILING | 0/11 | 11 | Repository initialization |
| Shot Service | ❌ FAILING | 0/9 | 9 | Repository initialization |
| Session Service | ❌ FAILING | 0/0 | Compilation | TypeScript type errors |
| Auth Integration | ❌ FAILING | 0/0 | Compilation | TypeScript type errors |

**Total:** 16 passing, 28+ failing, 2 not compiling

---

## Root Causes Identified

### 1. Repository Initialization Issue (Priority 1 - CRITICAL)

**Affected:** All service tests (auth, athlete, shot)

**Problem:**
```typescript
class ShotService {
  private shotRepository = AppDataSource.getRepository(Shot);  // ← Called at class definition time
}
```

The repository is initialized as a class property when the service class is defined, **before** the test mocking happens. This means `AppDataSource.getRepository` is called with the real AppDataSource (which is not initialized in tests), resulting in `undefined`.

**Error Message:**
```
TypeError: Cannot read properties of undefined (reading 'create')
```

**Why This Happens:**
1. Service class is defined with `private shotRepository = AppDataSource.getRepository(Shot)`
2. This line executes when the module is imported
3. Test mocks `AppDataSource.getRepository` in `beforeEach()`
4. But by then, the repository property is already set to `undefined`

**Solution Options:**

#### Option A: Lazy Repository Initialization (Recommended)
Modify services to initialize repositories in constructor or getter:

```typescript
class ShotService {
  private _shotRepository?: Repository<Shot>;

  private get shotRepository() {
    if (!this._shotRepository) {
      this._shotRepository = AppDataSource.getRepository(Shot);
    }
    return this._shotRepository;
  }
}
```

#### Option B: Dependency Injection
Pass repository as constructor parameter:

```typescript
class ShotService {
  constructor(private shotRepository: Repository<Shot>) {}
}

// In production
export const shotService = new ShotService(AppDataSource.getRepository(Shot));

// In tests
const mockRepo = createMockRepository<Shot>();
const service = new ShotService(mockRepo);
```

#### Option C: Factory Function (Minimal Changes)
Export a factory function that creates the service after mocking:

```typescript
// In test
jest.mock('../../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn()
  }
}));

// Then import service AFTER mock is set up
const { shotService } = require('../../../services/shot.service');
```

---

### 2. TypeScript Type Errors (Priority 2 - HIGH)

**Affected:** Session service tests, Auth integration tests

#### Issue A: Missing Required Properties in Mock Objects

**File:** `session.service.test.ts:65`

**Error:**
```typescript
Type '{ id: string; athlete: {...}; coach: {...}; shots: []; start_time: Date; status: string; }'
is missing the following properties from type 'TrainingSession':
total_shots, successful_shots, created_at, updated_at, rallies
```

**Fix:** Add all required properties to mock objects:

```typescript
const mockSession = {
  id: 'session-123',
  athlete: { id: 'athlete-123', athlete_name: 'John Doe' },
  coach: { id: 'coach-123', username: 'coach' },
  shots: [],
  start_time: new Date(),
  status: 'in_progress',
  // Add missing properties:
  total_shots: 0,
  successful_shots: 0,
  created_at: new Date(),
  updated_at: new Date(),
  rallies: []
};
```

#### Issue B: Express Request Type Augmentation

**File:** `auth.integration.test.ts:12`

**Error:**
```typescript
Type '{ id: string; email: string; username: string; }' is not assignable to type 'never'.
```

**Problem:** The test is trying to augment Express Request with a `user` property, but TypeScript doesn't recognize it.

**Fix:** Create proper type definition:

```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// In test
const mockAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  req.user = { id: 'user-123', email: 'test@example.com', username: 'testuser' };
  next();
};
```

---

## Detailed Fix Plan

### Phase 1: Fix Repository Initialization (Estimated: 2 hours)

#### Step 1.1: Modify Service Classes
Update all service files to use lazy initialization:

**Files to modify:**
- [badminton-backend/src/services/auth.service.ts](badminton-backend/src/services/auth.service.ts)
- [badminton-backend/src/services/athlete.service.ts](badminton-backend/src/services/athlete.service.ts)
- [badminton-backend/src/services/shot.service.ts](badminton-backend/src/services/shot.service.ts)
- [badminton-backend/src/services/session.service.ts](badminton-backend/src/services/session.service.ts)

**Pattern to apply:**
```typescript
class ServiceName {
  private _repository?: Repository<Entity>;

  private get repository() {
    if (!this._repository) {
      this._repository = AppDataSource.getRepository(Entity);
    }
    return this._repository;
  }

  // Use this.repository instead of this.entityRepository everywhere
  async someMethod() {
    return await this.repository.find();
  }
}
```

#### Step 1.2: Verify Tests Pass
```bash
cd badminton-backend
npm test -- --testPathPattern="services"
```

---

### Phase 2: Fix TypeScript Type Errors (Estimated: 1 hour)

#### Step 2.1: Fix Session Service Test Mock Objects

**File:** [badminton-backend/src/__tests__/unit/services/session.service.test.ts](badminton-backend/src/__tests__/unit/services/session.service.test.ts:65)

Add missing properties to all mock session objects:
```typescript
const completeMockSession = {
  id: 'session-123',
  athlete: { id: 'athlete-123', athlete_name: 'John Doe' },
  coach: { id: 'coach-123', username: 'coach' },
  shots: [],
  start_time: new Date(),
  end_time: null,
  status: 'in_progress',
  total_shots: 0,
  successful_shots: 0,
  average_accuracy_cm: null,
  average_accuracy_percent: null,
  average_velocity_kmh: null,
  notes: null,
  rating: null,
  created_at: new Date(),
  updated_at: new Date(),
  rallies: []
};
```

#### Step 2.2: Fix Auth Integration Test Types

**File:** [badminton-backend/src/__tests__/integration/auth.integration.test.ts](badminton-backend/src/__tests__/integration/auth.integration.test.ts:12)

Add proper TypeScript interface:
```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// Update mock middleware
const mockAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as AuthRequest).user = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser'
  };
  next();
};
```

---

### Phase 3: Add Missing Tests (Estimated: 4-6 hours)

Based on the TESTING_GUIDE.md, the following test suites are missing:

#### 3.1 Backend Integration Tests (Not Yet Implemented)

**Missing Integration Tests:**
1. **Athlete Integration Tests** (`src/__tests__/integration/athlete.integration.test.ts`)
   - POST /api/athletes - Create athlete
   - GET /api/athletes - List athletes
   - GET /api/athletes/:id - Get athlete by ID
   - PUT /api/athletes/:id - Update athlete
   - DELETE /api/athletes/:id - Delete athlete

2. **Session Integration Tests** (`src/__tests__/integration/session.integration.test.ts`)
   - POST /api/sessions/start - Start training session
   - POST /api/sessions/:id/stop - Stop session
   - GET /api/sessions - List sessions with pagination
   - GET /api/sessions/:id - Get session with shots

#### 3.2 Backend Controller Tests (Not Yet Implemented)

**Missing Controller Tests:**
- Auth controller tests
- Athlete controller tests
- Session controller tests

According to TESTING_GUIDE.md, controller coverage is at 60% (needs improvement).

#### 3.3 Backend WebSocket Tests (Not Yet Implemented)

**Missing WebSocket Tests:**
- Socket.IO handler tests
- Real-time event broadcasting tests
- Room management tests

According to TESTING_GUIDE.md, WebSocket coverage is at 40% (needs tests).

#### 3.4 Frontend Tests (Minimal Coverage)

**Existing:**
- Login component tests (1 test file)

**Missing Frontend Tests:**
1. **Component Tests:**
   - Register.test.tsx
   - TrainingControl.test.tsx (athlete selector, start/stop, WebSocket updates)
   - CourtVisualization.test.tsx (SVG rendering, shot positioning, color coding)
   - AthleteManagement.test.tsx
   - PerformanceDashboard.test.tsx
   - SessionDetail.test.tsx
   - Navigation.test.tsx

2. **Context Tests:**
   - AuthContext.test.tsx (login, logout, token persistence)
   - TrainingContext.test.tsx (WebSocket integration)

3. **Utility Tests:**
   - api.test.ts (API utility functions)

---

## Testing Checklist

### Immediate Fixes (Priority 1)

- [ ] Fix repository initialization in auth.service.ts
- [ ] Fix repository initialization in athlete.service.ts
- [ ] Fix repository initialization in shot.service.ts
- [ ] Fix repository initialization in session.service.ts
- [ ] Run unit tests to verify fixes: `npm test -- --testPathPattern="services"`

### Type Error Fixes (Priority 2)

- [ ] Fix session service test mock objects (add missing properties)
- [ ] Fix auth integration test type definitions
- [ ] Run all tests to verify compilation: `npm test`

### Integration Tests (Priority 3)

- [ ] Create athlete.integration.test.ts (5 test cases)
- [ ] Create session.integration.test.ts (4 test cases)
- [ ] Run integration tests: `npm test -- --testPathPattern="integration"`

### Additional Backend Tests (Priority 4)

- [ ] Create controller tests (auth, athlete, session)
- [ ] Create WebSocket handler tests
- [ ] Verify 70% coverage target: `npm test -- --coverage`

### Frontend Tests (Priority 5)

- [ ] Create Register.test.tsx
- [ ] Create TrainingControl.test.tsx
- [ ] Create CourtVisualization.test.tsx
- [ ] Create AuthContext.test.tsx
- [ ] Verify 60% coverage target: `npm test -- --coverage --watchAll=false`

---

## Expected Test Coverage After Fixes

### Backend

| Module | Current | After Phase 1-2 | After Phase 3 | Target |
|--------|---------|-----------------|---------------|--------|
| Services | 0% | 85% | 85% | 70% |
| Middleware | 80% | 80% | 80% | 70% |
| Controllers | 0% | 0% | 60% | 70% |
| WebSocket | 0% | 0% | 40% | 70% |
| **Overall** | **~20%** | **~40%** | **~65%** | **70%** |

### Frontend

| Module | Current | After Phase 3 | Target |
|--------|---------|---------------|--------|
| Components | 5% | 50% | 60% |
| Context | 0% | 30% | 60% |
| Utils | 0% | 70% | 60% |
| **Overall** | **~5%** | **~50%** | **60%** |

---

## Quick Start Guide

### To Fix Immediate Issues (30 minutes)

1. **Apply lazy repository initialization** to one service (e.g., shot.service.ts):
```typescript
// In shot.service.ts
class ShotService {
  private _shotRepository?: Repository<Shot>;

  private get shotRepository() {
    if (!this._shotRepository) {
      this._shotRepository = AppDataSource.getRepository(Shot);
    }
    return this._shotRepository;
  }

  async createShot(data: CreateShotData) {
    const shot = this.shotRepository.create({...});  // Changed from this.shotRepository
    return await this.shotRepository.save(shot);
  }

  // Update all other methods similarly
}
```

2. **Run tests**:
```bash
cd badminton-backend
npm test -- --testPathPattern="shot.service"
```

3. **Verify 9/9 shot service tests pass**

4. **Repeat for other services**

### To Fix TypeScript Errors (15 minutes)

1. **Update session test mock objects** with all required properties
2. **Add AuthRequest interface** to auth integration tests
3. **Run tests**: `npm test`

---

## Recommendations

### Immediate Action (Today)

1. ✅ **Fix repository initialization** - This unblocks 28 failing tests
2. ✅ **Fix TypeScript errors** - This allows 2 test suites to compile

**Expected result:** ~44 passing tests (16 current + 28 service tests)

### Short Term (This Week)

3. ✅ **Add integration tests** - Critical for API endpoint coverage
4. ✅ **Add controller tests** - Needed to reach 70% backend coverage

**Expected result:** ~70% backend coverage

### Medium Term (Next Week)

5. ✅ **Add WebSocket tests** - Important for real-time features
6. ✅ **Add frontend component tests** - Core user interface testing

**Expected result:** 70% backend + 60% frontend coverage (target met)

---

## Notes

- **All middleware tests are passing** - The test infrastructure is correct
- **Repository initialization is the blocker** - Not a test framework issue
- **Type errors are minor** - Just missing properties in mock objects
- **Test infrastructure is excellent** - Well-organized, properly mocked, comprehensive

**Once repository initialization is fixed, expect immediate jump from 16 → 44+ passing tests.**

---

## References

- [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - Comprehensive testing guide
- [TEST_RESULTS_SUMMARY.md](TEST_RESULTS_SUMMARY.md) - Current test status
- [CLAUDE.md](CLAUDE.md) - Project documentation

**Last Updated:** 2026-01-18
