import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Save } from '@mui/icons-material';

interface SessionSaveDialogProps {
  open: boolean;
  session: any;
  athleteName?: string;
  fetchingLatestData: boolean;
  onSave: (notes: string, rating: number | null) => Promise<void>;
  onClose: () => void;
}

/**
 * EXTRACTED COMPONENT: Session Save Dialog
 *
 * Responsibilities:
 * - Session summary display
 * - Notes and rating input
 * - Save/cancel actions
 *
 * Optimization: Memoized, local state management for form fields
 */
const SessionSaveDialog: React.FC<SessionSaveDialogProps> = ({
  open,
  session,
  athleteName,
  fetchingLatestData,
  onSave,
  onClose,
}) => {
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSessionNotes('');
      setSessionRating(null);
      setError('');
      setSaving(false);
    }
  }, [open]);

  // OPTIMIZATION: Memoize duration calculation
  const duration = useMemo(() => {
    if (!session?.start_time) return '-';
    const start = new Date(session.start_time);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }, [session?.start_time]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await onSave(sessionNotes, sessionRating);
    } catch (err: any) {
      setError(err.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Save />
          Training Session Completed
          {fetchingLatestData && <CircularProgress size={20} sx={{ ml: 'auto' }} />}
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Session Summary */}
        {session && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Athlete:</strong> {athleteName || 'Unknown'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Duration:</strong> {duration}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Total Shots:</strong> {session.total_shots || 0}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Successful Shots:</strong> {session.successful_shots || 0}
            </Typography>

            {session.total_shots > 0 && (
              <>
                <Typography variant="body1" gutterBottom>
                  <strong>Average Accuracy:</strong>{' '}
                  {session.average_accuracy_percent !== null &&
                  session.average_accuracy_percent !== undefined
                    ? `${Number(session.average_accuracy_percent).toFixed(1)}%`
                    : '-'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Average Velocity:</strong>{' '}
                  {session.average_shot_velocity_kmh !== null &&
                  session.average_shot_velocity_kmh !== undefined
                    ? `${Number(session.average_shot_velocity_kmh).toFixed(1)} km/h`
                    : '-'}
                </Typography>
              </>
            )}
          </Box>
        )}

        {/* Rating */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Rate this session:
          </Typography>
          <Rating
            value={sessionRating}
            onChange={(_, newValue) => setSessionRating(newValue)}
            size="large"
          />
        </Box>

        {/* Notes */}
        <TextField
          autoFocus
          margin="dense"
          label="Session Notes (Optional)"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="Add any notes about this training session..."
        />

        {/* Error Display */}
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" startIcon={<Save />} disabled={saving}>
          {saving ? 'Saving...' : 'Save Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SessionSaveDialog);
