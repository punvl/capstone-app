import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { TrendingUp, FitnessCenter, Speed, Adjust } from '@mui/icons-material';
import { useTraining } from '../context/TrainingContext';
import { api } from '../utils/api';
import { TrainingSession, Shot, TargetTemplate } from '../types';
import SessionFilterControl, { SessionFilter } from './performance/SessionFilterControl';
import TrainingHistoryTable from './performance/TrainingHistoryTable';
import TemplatePerformanceSection from './performance/TemplatePerformanceSection';

interface StatCardProps {
  value: string;
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, accentColor, icon }) => (
  <Card sx={{
    borderLeft: `3px solid ${accentColor}`,
    borderRadius: '6px',
    background: '#141E30',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: `radial-gradient(ellipse at top left, ${accentColor}0D 0%, transparent 60%)`,
      pointerEvents: 'none',
    },
  }}>
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontFamily: '"Bebas Neue", cursive', fontSize: '2.6rem', color: accentColor, lineHeight: 1, letterSpacing: '0.02em' }}>
            {value}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#8B9EC4', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, mt: 0.5 }}>
            {label}
          </Typography>
        </Box>
        <Box sx={{ color: accentColor, opacity: 0.4, mt: 0.5 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const applyFilter = (sessions: TrainingSession[], filter: SessionFilter): TrainingSession[] => {
  const sorted = [...sessions].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  if (filter === 'latest5') return sorted.slice(0, 5);
  if (filter === 'latest10') return sorted.slice(0, 10);
  if (filter === 'latest20') return sorted.slice(0, 20);
  return sorted;
};

const PerformanceDashboard: React.FC = () => {
  const { athletes, loadAthletes } = useTraining();
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');
  const [templates, setTemplates] = useState<TargetTemplate[]>([]);
  const [shotCache, setShotCache] = useState<Record<string, Shot[]>>({});
  const [loadingShots, setLoadingShots] = useState(false);

  const loadSessions = useCallback(async (athleteId: string) => {
    try {
      const result = await api.getSessions({ athleteId });
      if (result.success) setSessions(result.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, []);

  useEffect(() => { loadAthletes(); }, [loadAthletes]);

  useEffect(() => {
    api.getTemplates().then((result) => {
      if (result.success) setTemplates(result.templates);
    });
  }, []);

  useEffect(() => {
    if (athletes.length > 0 && !selectedAthleteId) setSelectedAthleteId(athletes[0].id);
  }, [athletes, selectedAthleteId]);

  useEffect(() => {
    if (selectedAthleteId) {
      setSessions([]);
      setShotCache({});
      loadSessions(selectedAthleteId);
    }
  }, [selectedAthleteId, loadSessions]);

  const filteredSessions = useMemo(() => applyFilter(sessions, sessionFilter), [sessions, sessionFilter]);

  // Fetch shot data for template sessions not yet cached
  useEffect(() => {
    const toFetch = filteredSessions.filter((s) => s.template_id && !shotCache[s.id]);
    if (toFetch.length === 0) return;
    setLoadingShots(true);
    Promise.all(
      toFetch.map((s) => api.getSession(s.id).then((r) => ({ id: s.id, shots: r.session?.shots || [] })))
    ).then((results) => {
      setShotCache((prev) => {
        const next = { ...prev };
        results.forEach((r) => { next[r.id] = r.shots; });
        return next;
      });
      setLoadingShots(false);
    }).catch(() => setLoadingShots(false));
  }, [filteredSessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const completed = filteredSessions.filter((s) => s.status === 'completed');
    if (completed.length === 0) return null;
    const totalShots = completed.reduce((sum, s) => sum + (s.total_shots || 0), 0);
    const withAccuracy = completed.filter((s) => s.average_accuracy_percent != null);
    const avgAccuracy = withAccuracy.length > 0
      ? withAccuracy.reduce((sum, s) => sum + Number(s.average_accuracy_percent), 0) / withAccuracy.length : 0;
    const withVelocity = completed.filter((s) => s.average_shot_velocity_kmh != null);
    const avgVelocity = withVelocity.length > 0
      ? withVelocity.reduce((sum, s) => sum + Number(s.average_shot_velocity_kmh), 0) / withVelocity.length : 0;
    const withScore = completed.filter((s) => s.average_score != null);
    const avgScore = withScore.length > 0
      ? withScore.reduce((sum, s) => sum + Number(s.average_score), 0) / withScore.length : 0;
    return { totalSessions: completed.length, totalShots, avgAccuracy, avgVelocity, avgScore };
  }, [filteredSessions]);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId);

  return (
    <Box sx={{ maxWidth: 1400, margin: '0 auto', padding: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <TrendingUp sx={{ color: '#00E5A0', fontSize: 22 }} />
          <Typography sx={{ fontFamily: '"Bebas Neue", cursive', fontSize: { xs: '1.8rem', md: '2.2rem' }, letterSpacing: '0.06em', color: '#EFF2F8', lineHeight: 1 }}>
            PERFORMANCE DASHBOARD
          </Typography>
        </Box>
        <Typography sx={{ color: '#8B9EC4', fontSize: '0.85rem', ml: 4 }}>
          Analyze athlete performance across training sessions
        </Typography>
      </Box>

      {/* Athlete Selection + Session Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#8B9EC4', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Athlete
            </Typography>
            <FormControl sx={{ minWidth: 280 }} size="small">
              <InputLabel>Select Athlete</InputLabel>
              <Select value={selectedAthleteId} onChange={(e) => setSelectedAthleteId(e.target.value)}>
                {athletes.map((athlete) => (
                  <MenuItem key={athlete.id} value={athlete.id}>
                    {athlete.athlete_name}
                    <Typography component="span" sx={{ ml: 1, fontSize: '0.75rem', color: '#8B9EC4' }}>
                      ({athlete.skill_level})
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <SessionFilterControl
              value={sessionFilter}
              onChange={setSessionFilter}
              totalCount={filteredSessions.length}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
          <StatCard value={String(stats.totalSessions)} label="Total Sessions" accentColor="#60A5FA" icon={<FitnessCenter />} />
          <StatCard value={String(stats.totalShots)} label="Total Shots" accentColor="#00E5A0" icon={<Adjust />} />
          <StatCard value={`${isNaN(stats.avgAccuracy) ? '0.0' : stats.avgAccuracy.toFixed(1)}%`} label="Avg Accuracy" accentColor="#F59E0B" icon={<TrendingUp />} />
          <StatCard value={`${isNaN(stats.avgVelocity) ? '0.0' : stats.avgVelocity.toFixed(1)}`} label="Avg Velocity km/h" accentColor="#A78BFA" icon={<Speed />} />
          <StatCard value={`${isNaN(stats.avgScore) ? '0.0' : stats.avgScore.toFixed(1)}`} label="Avg Score" accentColor="#60A5FA" icon={<TrendingUp />} />
        </Box>
      )}

      {/* Template Performance */}
      {templates.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <TemplatePerformanceSection
            templates={templates}
            sessions={filteredSessions}
            shotDataBySessionId={shotCache}
            isLoading={loadingShots}
          />
        </Box>
      )}

      {/* Training History Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TrainingHistoryTable
            sessions={filteredSessions}
            athleteName={selectedAthlete?.athlete_name || ''}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default PerformanceDashboard;
