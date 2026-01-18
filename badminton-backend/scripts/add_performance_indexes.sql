-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Add Missing Database Indexes
-- ============================================================================
-- Description: Adds indexes for foreign keys and frequently queried columns
-- Impact: Significantly improves query performance for sessions, shots, athletes
-- Execution: Safe to run on production (CREATE INDEX IF NOT EXISTS is idempotent)
-- Estimated Time: 1-5 minutes depending on data volume
-- ============================================================================

\echo '🔧 Adding performance indexes to badminton_training database...'

-- ============================================================================
-- TRAINING SESSIONS INDEXES
-- ============================================================================

\echo 'Creating indexes for training_sessions table...'

-- Foreign key indexes (critical for JOINs)
CREATE INDEX IF NOT EXISTS idx_sessions_athlete_id
ON training_sessions(athlete_id);

CREATE INDEX IF NOT EXISTS idx_sessions_coach_id
ON training_sessions(coach_id);

-- Status filter (used in session listing)
CREATE INDEX IF NOT EXISTS idx_sessions_status
ON training_sessions(status);

-- Time-based queries (session history, date ranges)
CREATE INDEX IF NOT EXISTS idx_sessions_start_time
ON training_sessions(start_time DESC);

-- Composite index for common query pattern (athlete + status)
CREATE INDEX IF NOT EXISTS idx_sessions_athlete_status
ON training_sessions(athlete_id, status);

-- Composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_sessions_start_end_time
ON training_sessions(start_time, end_time);

\echo '✓ Training sessions indexes created'

-- ============================================================================
-- SHOTS INDEXES
-- ============================================================================

\echo 'Creating indexes for shots table...'

-- Foreign key to session (critical - used in EVERY shot query)
CREATE INDEX IF NOT EXISTS idx_shots_session_id
ON shots(session_id);

-- Shot number (used for ordering)
CREATE INDEX IF NOT EXISTS idx_shots_shot_number
ON shots(shot_number);

-- Composite index for session + shot number (unique constraint pattern)
CREATE INDEX IF NOT EXISTS idx_shots_session_shot
ON shots(session_id, shot_number);

-- Accuracy queries (for filtering by accuracy threshold)
CREATE INDEX IF NOT EXISTS idx_shots_accuracy
ON shots(accuracy_cm);

-- Successful shots filter
CREATE INDEX IF NOT EXISTS idx_shots_was_successful
ON shots(was_successful);

-- Timestamp for chronological ordering
CREATE INDEX IF NOT EXISTS idx_shots_timestamp
ON shots(timestamp DESC);

\echo '✓ Shots indexes created'

-- ============================================================================
-- ATHLETES INDEXES
-- ============================================================================

\echo 'Creating indexes for athletes table...'

-- Foreign key to coach
CREATE INDEX IF NOT EXISTS idx_athletes_coach_id
ON athletes(coach_id);

-- Skill level filter (for analytics/grouping)
CREATE INDEX IF NOT EXISTS idx_athletes_skill_level
ON athletes(skill_level);

-- Composite index for coach + skill level
CREATE INDEX IF NOT EXISTS idx_athletes_coach_skill
ON athletes(coach_id, skill_level);

\echo '✓ Athletes indexes created'

-- ============================================================================
-- RALLIES INDEXES (if table exists)
-- ============================================================================

\echo 'Creating indexes for rallies table (if exists)...'

CREATE INDEX IF NOT EXISTS idx_rallies_session_id
ON rallies(session_id);

CREATE INDEX IF NOT EXISTS idx_rallies_start_time
ON rallies(start_time);

\echo '✓ Rallies indexes created'

-- ============================================================================
-- RALLY EVENTS INDEXES (if table exists)
-- ============================================================================

\echo 'Creating indexes for rally_events table (if exists)...'

CREATE INDEX IF NOT EXISTS idx_rally_events_rally_id
ON rally_events(rally_id);

CREATE INDEX IF NOT EXISTS idx_rally_events_timestamp
ON rally_events(timestamp);

\echo '✓ Rally events indexes created'

-- ============================================================================
-- UPDATE TABLE STATISTICS
-- ============================================================================

\echo 'Updating table statistics for query planner...'

ANALYZE training_sessions;
ANALYZE shots;
ANALYZE athletes;
ANALYZE rallies;
ANALYZE rally_events;

\echo '✓ Statistics updated'

-- ============================================================================
-- VERIFY INDEXES
-- ============================================================================

\echo '📊 Index Summary:'

SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('training_sessions', 'shots', 'athletes', 'rallies', 'rally_events')
ORDER BY tablename, indexname;

-- ============================================================================
-- PERFORMANCE TIPS
-- ============================================================================

\echo ''
\echo '💡 Performance Tips:'
\echo '  1. Run ANALYZE periodically (weekly recommended)'
\echo '  2. Monitor index usage with pg_stat_user_indexes'
\echo '  3. Check for unused indexes after 1 month'
\echo '  4. VACUUM ANALYZE after bulk data imports'
\echo ''
\echo '✅ Performance indexes successfully created!'
\echo ''

-- ============================================================================
-- OPTIONAL: Check Index Usage (run after 1 week)
-- ============================================================================

\echo 'To check index usage after 1 week, run:'
\echo '  SELECT * FROM pg_stat_user_indexes WHERE schemaname = '\''public'\'';'
\echo ''
