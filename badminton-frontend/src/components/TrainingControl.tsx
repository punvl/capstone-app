import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  CircularProgress,
} from '@mui/material';
import { PlayArrow, Stop, Save, Person, Timer, SportsTennis, AddCircle } from '@mui/icons-material';
import { useTraining } from '../context/TrainingContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import CourtVisualization from './CourtVisualization';

const TrainingControl: React.FC = () => {
  const {
    athletes,
    selectedAthlete,
    currentSession,
    isTrainingActive,
    liveCourtData,
    loadAthletes,
    selectAthlete,
    startTraining,
    stopTraining,
    saveSession,
  } = useTraining();

  const navigate = useNavigate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [sessionToSave, setSessionToSave] = useState<any>(null);
  const [fetchingLatestData, setFetchingLatestData] = useState(false);

  useEffect(() => {
    loadAthletes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAthleteChange = (athleteId: string) => {
    const athlete = athletes.find((a) => a.id === athleteId);
    if (athlete) {
      selectAthlete(athlete);
    }
  };

  const handleStartTraining = async () => {
    if (!selectedAthlete) {
      setError('Please select an athlete first!');
      return;
    }
    try {
      setError('');
      await startTraining();
    } catch (err: any) {
      setError(err.message || 'Failed to start training');
    }
  };

  const handleStopTraining = async () => {
    try {
      // Store current session before stopping (stats are already updated via WebSocket)
      setSessionToSave(currentSession);
      
      // Show dialog immediately - no need to wait!
      setSaveDialogOpen(true);
      
      // Stop the training (closes WebSocket connection)
      await stopTraining();
      
      // Fetch latest session data in the background to double-check
      // This happens while user is filling out the dialog
      if (currentSession?.id) {
        setFetchingLatestData(true);
        console.log('Fetching latest session data in background...');
        api.getSession(currentSession.id).then((result) => {
          if (result.success && result.session) {
            console.log('Updated session data fetched:', result.session);
            // Update the dialog with the latest data if it's still open
            setSessionToSave(result.session);
          }
        }).catch((err) => {
          console.warn('Failed to fetch latest session data:', err);
          // No problem - we already have the data from WebSocket updates
        }).finally(() => {
          setFetchingLatestData(false);
        });
      }
    } catch (err: any) {
      console.error('Error stopping training:', err);
      // Still show dialog with current session data
      setSessionToSave(currentSession);
      setSaveDialogOpen(true);
    }
  };

  const handleSaveSession = async () => {
    try {
      // Use sessionToSave instead of currentSession from context
      if (!sessionToSave?.id) {
        setError('No session to save');
        return;
      }

      console.log('Saving session:', sessionToSave.id, { notes: sessionNotes, rating: sessionRating });
      
      // Call the API directly with the sessionToSave ID
      const result = await api.stopSession(sessionToSave.id, {
        sessionNotes: sessionNotes,
        sessionRating: sessionRating || undefined,
      });

      console.log('Session saved successfully:', result);
      
      // Clean up dialog state
      setSaveDialogOpen(false);
      setSessionNotes('');
      setSessionRating(null);
      setSessionToSave(null);
      setError(''); // Clear any errors
      
      // Clean up context state (currentSession, liveCourtData, isTrainingActive)
      // This won't make another API call since currentSession might be null
      await saveSession();
      
      // Navigate to performance page to see the saved session
      setTimeout(() => navigate('/performance'), 500);
    } catch (err: any) {
      console.error('Save session error:', err);
      setError(err.message || 'Failed to save session');
    }
  };

  const handleCloseDialog = () => {
    setSaveDialogOpen(false);
    setSessionNotes('');
    setSessionRating(null);
    setSessionToSave(null);
    setFetchingLatestData(false);
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        🏸 Badminton Training Control
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3 }}>
        {/* Left Column: Controls */}
        <Box>
          {/* Athlete Selection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person />
                  <Typography variant="h6">Athlete Selection</Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<AddCircle />}
                  onClick={() => navigate('/athletes')}
                >
                  New Athlete
                </Button>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Select Athlete</InputLabel>
                <Select
                  value={selectedAthlete?.id || ''}
                  onChange={(e) => handleAthleteChange(e.target.value)}
                  disabled={isTrainingActive}
                >
                  {athletes.map((athlete) => (
                    <MenuItem key={athlete.id} value={athlete.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {athlete.athlete_name}
                        <Chip
                          label={athlete.skill_level}
                          size="small"
                          color={
                            athlete.skill_level === 'beginner'
                              ? 'default'
                              : athlete.skill_level === 'intermediate'
                              ? 'primary'
                              : 'success'
                          }
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedAthlete && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Selected: <strong>{selectedAthlete.athlete_name}</strong> ({selectedAthlete.skill_level} level)
                </Alert>
              )}

              {athletes.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  No athletes found. Create your first athlete to begin.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Training Controls */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <SportsTennis />
                <Typography variant="h6">Training Session</Typography>
                {isTrainingActive && (
                  <Chip label="TRAINING ACTIVE" color="success" variant="filled" sx={{ fontWeight: 'bold' }} />
                )}
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Show Session ID when training is active */}
              {isTrainingActive && currentSession && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    <strong>📋 Session ID (copy this for mock CV script):</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      wordBreak: 'break-all',
                      userSelect: 'all',
                      cursor: 'pointer',
                      bgcolor: 'rgba(0,0,0,0.05)',
                      p: 1,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
                    }}
                    onClick={(e) => {
                      navigator.clipboard.writeText(currentSession.id);
                      alert('Session ID copied to clipboard!');
                    }}
                  >
                    {currentSession.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    💡 Click to copy • Run: <code>python3 mock_cv_component.py {currentSession.id}</code>
                  </Typography>
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  startIcon={<PlayArrow />}
                  onClick={handleStartTraining}
                  disabled={!selectedAthlete || isTrainingActive}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  START TRAINING
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  fullWidth
                  startIcon={<Stop />}
                  onClick={handleStopTraining}
                  disabled={!isTrainingActive}
                  sx={{ py: 2, fontSize: '1.1rem' }}
                >
                  STOP TRAINING
                </Button>
              </Box>

              {!selectedAthlete && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Please select an athlete before starting training
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Live Training Status */}
          {isTrainingActive && currentSession && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Timer />
                  <Typography variant="h6">Session Info</Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="h6">{formatDuration(currentSession.start_time)}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Shots
                    </Typography>
                    <Typography variant="h6">{currentSession.total_shots}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Successful Shots
                    </Typography>
                    <Typography variant="h6">{currentSession.successful_shots}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                    <Typography variant="h6">
                      {currentSession.total_shots > 0
                        ? ((currentSession.successful_shots / currentSession.total_shots) * 100).toFixed(1)
                        : 0}
                      %
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Right Column: Court Visualization */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SportsTennis />
                {isTrainingActive ? 'Live Shot Tracking' : 'Court View'}
              </Typography>

              {!isTrainingActive && !liveCourtData && (
                <Box
                  sx={{
                    height: 450,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    Start a training session to see live shot tracking
                  </Typography>
                </Box>
              )}

              {(isTrainingActive || liveCourtData) && (
                <CourtVisualization
                  mode="live"
                  currentShot={liveCourtData || undefined}
                  width={Math.min(700, window.innerWidth - 100)}
                  height={450}
                />
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Session Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Save />
            Training Session Completed
            {fetchingLatestData && (
              <CircularProgress size={20} sx={{ ml: 'auto' }} />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {sessionToSave && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Athlete:</strong> {selectedAthlete?.athlete_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Duration:</strong> {formatDuration(sessionToSave.start_time)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Total Shots:</strong> {sessionToSave.total_shots || 0}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Successful Shots:</strong> {sessionToSave.successful_shots || 0}
              </Typography>
              {sessionToSave.total_shots > 0 && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Average Accuracy:</strong>{' '}
                    {sessionToSave.average_accuracy_percent !== null && sessionToSave.average_accuracy_percent !== undefined
                      ? `${Number(sessionToSave.average_accuracy_percent).toFixed(1)}%`
                      : '-'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Average Velocity:</strong>{' '}
                    {sessionToSave.average_shot_velocity_kmh !== null && sessionToSave.average_shot_velocity_kmh !== undefined
                      ? `${Number(sessionToSave.average_shot_velocity_kmh).toFixed(1)} km/h`
                      : '-'}
                  </Typography>
                </>
              )}
            </Box>
          )}

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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveSession} variant="contained" startIcon={<Save />}>
            Save Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainingControl;


