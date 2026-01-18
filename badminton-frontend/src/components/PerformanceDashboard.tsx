import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import { Visibility, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTraining } from '../context/TrainingContext';
import { api } from '../utils/api';
import { TrainingSession } from '../types';

const PerformanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { athletes, loadAthletes } = useTraining();
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);

  useEffect(() => {
    loadAthletes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (athletes.length > 0 && !selectedAthleteId) {
      setSelectedAthleteId(athletes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athletes]);

  useEffect(() => {
    if (selectedAthleteId) {
      loadSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAthleteId]);

  const loadSessions = async () => {
    try {
      const result = await api.getSessions({ athleteId: selectedAthleteId });
      if (result.success) {
        setSessions(result.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const calculateStats = () => {
    const completedSessions = sessions.filter((s) => s.status === 'completed');
    if (completedSessions.length === 0) return null;

    const totalShots = completedSessions.reduce((sum, s) => sum + (s.total_shots || 0), 0);
    
    // Calculate average accuracy (only from sessions with shot data)
    const sessionsWithAccuracy = completedSessions.filter((s) => 
      s.average_accuracy_percent !== null && s.average_accuracy_percent !== undefined
    );
    const avgAccuracy = sessionsWithAccuracy.length > 0
      ? sessionsWithAccuracy.reduce((sum, s) => sum + Number(s.average_accuracy_percent), 0) / sessionsWithAccuracy.length
      : 0;
    
    // Calculate average velocity (only from sessions with shot data)
    const sessionsWithVelocity = completedSessions.filter((s) => 
      s.average_shot_velocity_kmh !== null && s.average_shot_velocity_kmh !== undefined
    );
    const avgVelocity = sessionsWithVelocity.length > 0
      ? sessionsWithVelocity.reduce((sum, s) => sum + Number(s.average_shot_velocity_kmh), 0) / sessionsWithVelocity.length
      : 0;

    return {
      totalSessions: completedSessions.length,
      totalShots,
      avgAccuracy,
      avgVelocity,
    };
  };

  const stats = calculateStats();
  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        📊 Performance Dashboard
      </Typography>

      {/* Athlete Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Select Athlete</InputLabel>
            <Select value={selectedAthleteId} onChange={(e) => setSelectedAthleteId(e.target.value)}>
              {athletes.map((athlete) => (
                <MenuItem key={athlete.id} value={athlete.id}>
                  {athlete.athlete_name} ({athlete.skill_level})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Performance Statistics */}
      {stats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp />
              Performance Statistics - {selectedAthlete?.athlete_name}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary">
                  {stats.totalSessions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sessions
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {stats.totalShots}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Shots
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">
                  {isNaN(stats.avgAccuracy) ? '0.0' : stats.avgAccuracy.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Accuracy
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography variant="h4" color="info.main">
                  {isNaN(stats.avgVelocity) ? '0.0' : stats.avgVelocity.toFixed(1)} km/h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Velocity
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Training History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Training History
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Coach</TableCell>
                  <TableCell align="center">Total Shots</TableCell>
                  <TableCell align="center">Accuracy</TableCell>
                  <TableCell align="center">Velocity</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/session/${session.id}`)}
                  >
                    <TableCell>
                      {formatDate(session.start_time)}
                    </TableCell>
                    <TableCell>{session.coach?.username || 'N/A'}</TableCell>
                    <TableCell align="center">{session.total_shots || 0}</TableCell>
                    <TableCell align="center">
                      {session.average_accuracy_percent !== null && session.average_accuracy_percent !== undefined
                        ? `${Number(session.average_accuracy_percent).toFixed(1)}%`
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {session.average_shot_velocity_kmh !== null && session.average_shot_velocity_kmh !== undefined
                        ? `${Number(session.average_shot_velocity_kmh).toFixed(1)} km/h`
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={session.status.toUpperCase()}
                        color={getStatusColor(session.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {session.session_rating ? `⭐ ${session.session_rating}` : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/session/${session.id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {sessions.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No training sessions found for {selectedAthlete?.athlete_name}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerformanceDashboard;

