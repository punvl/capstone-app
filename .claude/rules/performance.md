---
name: performance-standards
---

# Performance Standards

You must ALWAYS consider performance implications of code changes.

## Performance Targets

### Backend API
- **Read endpoints**: < 200ms response time
- **Write endpoints**: < 500ms response time
- **WebSocket latency**: < 50ms for message delivery
- **Database queries**: < 100ms for simple queries

### Frontend
- **Initial load**: < 2 seconds
- **Time to Interactive (TTI)**: < 3 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100ms

## Algorithm Complexity

### Time Complexity Rules
- **Avoid O(n²)** - Use hashmaps, sets, or proper algorithms
- **Prefer O(n log n)** for sorting when necessary
- **Target O(n) or better** for data processing
- **O(1) lookups** - Use Maps/Objects for key-based access

### Examples
```typescript
// ❌ BAD - O(n²) nested loops
athletes.forEach(athlete => {
  sessions.forEach(session => {
    if (session.athleteId === athlete.id) {
      // process
    }
  });
});

// ✅ GOOD - O(n) with hashmap
const sessionsByAthlete = sessions.reduce((map, session) => {
  if (!map[session.athleteId]) map[session.athleteId] = [];
  map[session.athleteId].push(session);
  return map;
}, {});

athletes.forEach(athlete => {
  const athleteSessions = sessionsByAthlete[athlete.id] || [];
  // process
});
```

## Database Performance

### Query Optimization
- **Always use indexes** on foreign keys and WHERE clauses
- **Avoid SELECT *** - Only query needed columns
- **Use pagination** for large result sets (limit/offset)
- **Eager load relationships** to prevent N+1 queries
- **Use database-level aggregations** (COUNT, SUM, AVG)

### N+1 Query Prevention
```typescript
// ❌ BAD - N+1 query problem
const sessions = await sessionRepo.find();
for (const session of sessions) {
  session.athlete = await athleteRepo.findOne(session.athleteId);
}

// ✅ GOOD - Eager loading
const sessions = await sessionRepo.find({
  relations: ['athlete'],
});
```

### Connection Pooling
- Use connection pools (default in TypeORM)
- Max pool size: 10-20 connections
- Monitor connection usage

## Caching Strategy

### Redis Caching
Cache these with TTL:
- **User sessions**: 15 minutes
- **Athlete profiles**: 5 minutes
- **Session statistics**: 1 minute
- **Leaderboards**: 30 seconds

```typescript
// Cache pattern
const cacheKey = `session:${sessionId}`;
let session = await redis.get(cacheKey);

if (!session) {
  session = await sessionRepo.findOne(sessionId);
  await redis.setex(cacheKey, 300, JSON.stringify(session));
}
```

### Cache Invalidation
- Invalidate on updates/deletes
- Use cache keys with version numbers
- Clear related caches (session → athlete)

## Frontend Performance

### React Optimization
```typescript
// ✅ Use memo for expensive components
const CourtVisualization = React.memo(({ shots }) => {
  // Heavy SVG rendering
}, (prevProps, nextProps) => {
  return prevProps.shots.length === nextProps.shots.length;
});

// ✅ Use useMemo for expensive calculations
const shotStats = useMemo(() => {
  return calculateComplexStatistics(shots);
}, [shots]);

// ✅ Use useCallback for functions passed as props
const handleShotClick = useCallback((shotId: string) => {
  // handle click
}, [dependency]);
```

### Lazy Loading
```typescript
// Code splitting for routes
const PerformanceDashboard = lazy(() => import('./components/PerformanceDashboard'));
const SessionDetail = lazy(() => import('./components/SessionDetail'));

// Lazy load heavy libraries
const ChartJS = lazy(() => import('chart.js'));
```

### Debounce & Throttle
```typescript
// Debounce search input
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    searchAthletes(query);
  }, 300),
  []
);

// Throttle scroll events
const throttledScroll = useMemo(
  () => throttle(() => {
    handleScroll();
  }, 100),
  []
);
```

## WebSocket Performance

### Message Optimization
- Send only changed data, not full objects
- Batch updates (max 10/second)
- Use binary formats for large payloads (MessagePack)
- Compress messages > 1KB

```typescript
// ✅ GOOD - Send only delta
socket.emit('shot_received', {
  shotId: newShot.id,
  accuracy: newShot.accuracy,
  position: newShot.landingPosition
});

// ❌ BAD - Send entire session
socket.emit('shot_received', fullSessionWithAllShots);
```

### Room Management
- Use Socket.IO rooms for targeted broadcasts
- Clean up rooms when sessions end
- Limit connections per user (max 3)

## Memory Management

### Backend
- Clear large arrays after processing
- Stream large file uploads
- Use worker threads for CPU-intensive tasks
- Monitor memory usage (< 80% of available)

### Frontend
- Clean up event listeners in useEffect
- Unsubscribe from WebSocket on unmount
- Clear intervals/timeouts
- Limit in-memory shot data (max 1000 shots)

```typescript
// ✅ GOOD - Cleanup
useEffect(() => {
  socket.on('shot_received', handleShot);

  return () => {
    socket.off('shot_received', handleShot);
  };
}, []);
```

## Bundle Size Optimization

### Code Splitting
- Split routes with React.lazy
- Dynamic imports for heavy features
- Tree-shaking (avoid default imports)

### Dependencies
- Audit bundle size: `npm run build -- --stats`
- Use lighter alternatives (date-fns > moment)
- Import only what you need (lodash/get vs lodash)

## RabbitMQ Performance

### Message Handling
- Acknowledge messages after processing
- Use prefetch limit (10 messages)
- Handle errors without blocking queue
- Monitor queue depth (< 1000 messages)

### Connection Management
- Reuse channels
- Reconnect on disconnect
- Use heartbeats (60 seconds)

## Monitoring & Profiling

### What to Monitor
- API response times (p50, p95, p99)
- Database query times
- Memory usage (backend & frontend)
- WebSocket message latency
- Queue depth
- Cache hit rate

### Profiling Tools
- Backend: Node.js profiler, clinic.js
- Frontend: React DevTools Profiler
- Database: PostgreSQL EXPLAIN ANALYZE
- Network: Chrome DevTools Network tab

## Performance Regression Prevention

### Before Committing
- [ ] Run lighthouse on frontend changes
- [ ] Check bundle size hasn't increased > 10%
- [ ] Profile database queries with EXPLAIN
- [ ] Verify no N+1 queries introduced
- [ ] Check for memory leaks in loops
- [ ] Ensure proper cleanup in useEffect

### Load Testing
- Test API endpoints with 100+ concurrent requests
- Simulate 50+ WebSocket connections
- Test with 10,000+ shots in database
- Monitor memory usage under load

## Quick Performance Checklist

When writing code, ask:
- [ ] What's the Big O complexity?
- [ ] Could this cause an N+1 query?
- [ ] Should this be cached?
- [ ] Is this component re-rendering unnecessarily?
- [ ] Are event listeners cleaned up?
- [ ] Could this be lazy loaded?
- [ ] Is this calculation memoized?
- [ ] Are database queries indexed?
