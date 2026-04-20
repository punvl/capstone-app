import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import { Visibility, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TrainingSession } from '../../types';

interface TrainingHistoryTableProps {
  sessions: TrainingSession[];
  athleteName: string;
}

const getStatusColor = (status: string): 'success' | 'error' | 'primary' | 'default' => {
  switch (status) {
    case 'completed': return 'success';
    case 'active': return 'primary';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · '
    + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const TrainingHistoryTable: React.FC<TrainingHistoryTableProps> = ({ sessions, athleteName }) => {
  const navigate = useNavigate();

  return (
    <>
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AccessTime sx={{ color: '#8B9EC4', fontSize: 18 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}>
          Training History
        </Typography>
        {athleteName && (
          <Chip label={athleteName} size="small" sx={{ ml: 0.5, fontSize: '0.72rem', height: 22 }} />
        )}
        <Typography sx={{ ml: 'auto', fontSize: '0.75rem', color: '#4B5563' }}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
      <Divider />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Coach</TableCell>
              <TableCell align="center">Shots</TableCell>
              <TableCell align="center">Accuracy</TableCell>
              <TableCell align="center">Score</TableCell>
              <TableCell align="center">Velocity</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="center">View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id} hover onClick={() => navigate(`/session/${session.id}`)}>
                <TableCell sx={{ color: '#EFF2F8', whiteSpace: 'nowrap' }}>
                  {formatDate(session.start_time)}
                </TableCell>
                <TableCell sx={{ color: '#8B9EC4' }}>
                  {session.coach?.username || 'N/A'}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#00E5A0' }}>
                  {session.total_shots || 0}
                </TableCell>
                <TableCell align="center">
                  {session.average_accuracy_percent != null ? (
                    <Typography sx={{
                      fontSize: '0.875rem', fontWeight: 600,
                      color: Number(session.average_accuracy_percent) >= 70 ? '#00E5A0'
                        : Number(session.average_accuracy_percent) >= 40 ? '#FBBF24' : '#F87171',
                    }}>
                      {Number(session.average_accuracy_percent).toFixed(1)}%
                    </Typography>
                  ) : <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>—</Typography>}
                </TableCell>
                <TableCell align="center">
                  {session.average_score != null ? (
                    <Typography sx={{
                      fontSize: '0.875rem', fontWeight: 600,
                      color: Number(session.average_score) >= 90 ? '#00E5A0'
                        : Number(session.average_score) >= 75 ? '#FBBF24' : '#F87171',
                    }}>
                      {Number(session.average_score).toFixed(1)}
                    </Typography>
                  ) : <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>—</Typography>}
                </TableCell>
                <TableCell align="center" sx={{ color: '#8B9EC4', fontSize: '0.875rem' }}>
                  {session.average_shot_velocity_kmh != null
                    ? `${Number(session.average_shot_velocity_kmh).toFixed(1)} km/h`
                    : <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>—</Typography>}
                </TableCell>
                <TableCell align="center">
                  <Chip label={session.status.toUpperCase()} color={getStatusColor(session.status)} size="small" />
                </TableCell>
                <TableCell align="center">
                  {session.session_rating ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Typography sx={{ color: '#F59E0B', fontSize: '0.875rem' }}>★</Typography>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{session.session_rating}</Typography>
                    </Box>
                  ) : <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>—</Typography>}
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    startIcon={<Visibility fontSize="small" />}
                    onClick={(e) => { e.stopPropagation(); navigate(`/session/${session.id}`); }}
                    sx={{ fontSize: '0.78rem', py: 0.5, px: 1.5 }}
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
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>
            No training sessions found for {athleteName || 'selected athlete'}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default TrainingHistoryTable;
