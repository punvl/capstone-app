-- ============================================================================
-- Migration: rename accuracy/success fields to score/in_box
-- ============================================================================
-- Changes applied:
--   shots.was_successful        → DROP (duplicate of in_box)
--   shots.accuracy_percent      → RENAME to score
--   training_sessions.successful_shots        → RENAME to in_box_shots
--   training_sessions.average_accuracy_percent → RENAME to average_score
--   training_sessions.average_score (legacy) → DROP (was a duplicate of avg_accuracy)
--
-- Run on: Railway production Postgres, after backend/frontend deploy.
-- Safe to re-run: each statement guarded so repeats are no-ops.
-- Wrap in a transaction so a failure mid-migration rolls everything back.
-- ============================================================================

BEGIN;

-- --- shots table -----------------------------------------------------------

-- 1. Drop was_successful (duplicate of in_box)
ALTER TABLE shots DROP COLUMN IF EXISTS was_successful;

-- 2. Rename accuracy_percent → score
--    Guard: only rename if accuracy_percent exists AND score does not.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shots' AND column_name = 'accuracy_percent'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shots' AND column_name = 'score'
  ) THEN
    ALTER TABLE shots RENAME COLUMN accuracy_percent TO score;
  END IF;
END $$;

-- --- training_sessions table -----------------------------------------------

-- 3. Drop the legacy average_score column (it duplicated accuracy) so that
--    we can cleanly rename average_accuracy_percent → average_score next.
ALTER TABLE training_sessions DROP COLUMN IF EXISTS average_score;

-- 4. Rename successful_shots → in_box_shots
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_sessions' AND column_name = 'successful_shots'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_sessions' AND column_name = 'in_box_shots'
  ) THEN
    ALTER TABLE training_sessions RENAME COLUMN successful_shots TO in_box_shots;
  END IF;
END $$;

-- 5. Rename average_accuracy_percent → average_score
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_sessions' AND column_name = 'average_accuracy_percent'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'training_sessions' AND column_name = 'average_score'
  ) THEN
    ALTER TABLE training_sessions RENAME COLUMN average_accuracy_percent TO average_score;
  END IF;
END $$;

-- --- Indexes ---------------------------------------------------------------

-- Drop the old index on was_successful if present (column no longer exists).
DROP INDEX IF EXISTS idx_shots_was_successful;

-- Recreate the in_box index (idempotent).
CREATE INDEX IF NOT EXISTS idx_shots_in_box ON shots (in_box);

COMMIT;

-- --- Verification ----------------------------------------------------------
-- Run after commit to confirm the final shape:
--   \d shots
--   \d training_sessions
