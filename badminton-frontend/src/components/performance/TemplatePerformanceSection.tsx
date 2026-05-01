import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@mui/material';
import { GridView, ShowChart } from '@mui/icons-material';
import { TargetTemplate, TrainingSession, Shot } from '../../types';
import CourtVisualization from '../CourtVisualization';
import PerformanceTrendChart from './PerformanceTrendChart';

interface TemplatePerformanceSectionProps {
  templates: TargetTemplate[];
  sessions: TrainingSession[];
  shotDataBySessionId: Record<string, Shot[]>;
  isLoading: boolean;
}

const POSITION_COLORS = ['#60A5FA', '#00E5A0', '#F59E0B', '#A78BFA', '#F87171'];

function computePositionStats(shots: Shot[]) {
  if (shots.length === 0) return null;
  const withScore = shots.filter((s) => s.score != null);
  const avgScore = withScore.length > 0
    ? withScore.reduce((sum, s) => sum + Number(s.score), 0) / withScore.length : 0;
  const withInBox = shots.filter((s) => s.in_box != null);
  const inBoxPct = withInBox.length > 0
    ? (withInBox.filter((s) => s.in_box).length / withInBox.length) * 100 : 0;
  return { avgScore, inBoxPct, count: shots.length };
}

function scoreColor(v: number) {
  return v >= 70 ? '#00E5A0' : v >= 40 ? '#FBBF24' : '#F87171';
}

const TemplatePerformanceSection: React.FC<TemplatePerformanceSectionProps> = ({
  templates,
  sessions,
  shotDataBySessionId,
  isLoading,
}) => {
  const [selectedId, setSelectedId] = useState<string>('');

  const selectedTemplate = templates.find((t) => t.id === selectedId) ?? null;

  // Sessions per template (completed only)
  const sessionsByTemplate = useMemo(() => {
    const map: Record<string, TrainingSession[]> = {};
    templates.forEach((t) => {
      map[t.id] = sessions.filter((s) => s.template_id === t.id && s.status === 'completed');
    });
    return map;
  }, [templates, sessions]);

  // All shots for selected template
  const allShots = useMemo(() => {
    if (!selectedTemplate) return [];
    return (sessionsByTemplate[selectedTemplate.id] || []).flatMap((s) => shotDataBySessionId[s.id] || []);
  }, [selectedTemplate, sessionsByTemplate, shotDataBySessionId]);

  // Shots grouped by position index for selected template
  const shotsByPosition = useMemo(() => {
    return allShots.reduce<Record<number, Shot[]>>((map, shot) => {
      const idx = shot.target_position_index ?? -1;
      if (idx >= 0) { if (!map[idx]) map[idx] = []; map[idx].push(shot); }
      return map;
    }, {});
  }, [allShots]);

  const templateSessions = selectedTemplate ? (sessionsByTemplate[selectedTemplate.id] || []) : [];
  const hasLoadedShots = templateSessions.every((s) => !!shotDataBySessionId[s.id]);

  // For all-templates trend: check if all template sessions have shot data loaded
  const allTemplateSessions = useMemo(
    () => sessions.filter((s) => s.template_id && s.status === 'completed'),
    [sessions]
  );
  const allTemplatesShotsLoaded = allTemplateSessions.every((s) => !!shotDataBySessionId[s.id]);

  return (
    <Card sx={{ background: '#0D1929', border: '1px solid #1E2D45', borderRadius: '8px' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>

        {/* Header + Dropdown */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GridView sx={{ fontSize: 16, color: '#8B9EC4' }} />
            <Typography sx={{ fontSize: '0.8rem', color: '#8B9EC4', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Template Performance
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Template</InputLabel>
            <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} label="Template">
              <MenuItem value=""><em>All Templates</em></MenuItem>
              {templates.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                  <Typography component="span" sx={{ ml: 1, fontSize: '0.72rem', color: '#8B9EC4' }}>
                    ({sessionsByTemplate[t.id]?.length ?? 0} sessions)
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* ALL TEMPLATES: summary table + trend charts */}
        {!selectedTemplate && (
          <>
            <Box sx={{ px: 3, py: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Template</TableCell>
                    <TableCell align="center">Sessions</TableCell>
                    <TableCell align="center">Avg Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((t) => {
                    const tSessions = sessionsByTemplate[t.id] || [];
                    if (tSessions.length === 0) {
                      return (
                        <TableRow key={t.id}>
                          <TableCell sx={{ color: '#EFF2F8' }}>{t.name}</TableCell>
                          <TableCell align="center" colSpan={2} sx={{ color: '#4B5563', fontSize: '0.8rem' }}>
                            No sessions
                          </TableCell>
                        </TableRow>
                      );
                    }
                    const withScore = tSessions.filter((s) => s.average_score != null);
                    const avgScore = withScore.length > 0
                      ? withScore.reduce((sum, s) => sum + Number(s.average_score), 0) / withScore.length : 0;
                    return (
                      <TableRow key={t.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedId(t.id)}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={t.id.toUpperCase()} size="small" sx={{ fontSize: '0.65rem', height: 18, background: '#1E2D45', color: '#8B9EC4' }} />
                            <Typography sx={{ fontSize: '0.875rem', color: '#EFF2F8' }}>{t.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, color: '#00E5A0' }}>{tSessions.length}</TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor(avgScore) }}>
                            {avgScore.toFixed(1)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            <Divider />

            <Box sx={{ px: 3, py: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShowChart sx={{ fontSize: 15, color: '#8B9EC4' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#8B9EC4', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  Score Trend (per session)
                </Typography>
              </Box>
              {isLoading && !allTemplatesShotsLoaded ? (
                <Skeleton variant="rounded" height={200} sx={{ bgcolor: '#1E2D45' }} />
              ) : (
                <PerformanceTrendChart
                  sessions={allTemplateSessions}
                  shotDataBySessionId={shotDataBySessionId}
                  mode="by-template"
                  metric="score"
                  templates={templates}
                />
              )}
            </Box>

            <Divider />

            <Box sx={{ px: 3, py: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShowChart sx={{ fontSize: 15, color: '#8B9EC4' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#8B9EC4', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  In-Box Trend (per session)
                </Typography>
              </Box>
              {isLoading && !allTemplatesShotsLoaded ? (
                <Skeleton variant="rounded" height={200} sx={{ bgcolor: '#1E2D45' }} />
              ) : (
                <PerformanceTrendChart
                  sessions={allTemplateSessions}
                  shotDataBySessionId={shotDataBySessionId}
                  mode="by-template"
                  metric="inBox"
                  templates={templates}
                />
              )}
            </Box>
          </>
        )}

        {/* SPECIFIC TEMPLATE: court viz + per-position table */}
        {selectedTemplate && (
          <>
            {templateSessions.length === 0 ? (
              <Box sx={{ px: 3, py: 3 }}>
                <Typography sx={{ color: '#4B5563', fontSize: '0.85rem' }}>
                  No completed sessions found for {selectedTemplate.name} with the current filter.
                </Typography>
              </Box>
            ) : (
              <>
                {/* Court viz + stats table side-by-side */}
                <Box sx={{ px: 3, py: 2.5, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {/* Court preview */}
                  <Box sx={{ flexShrink: 0 }}>
                    <CourtVisualization
                      mode="preview"
                      width={260}
                      height={286}
                      halfCourt={true}
                      templatePositions={selectedTemplate.positions}
                    />
                  </Box>

                  {/* Per-position table */}
                  <Box sx={{ flex: 1, minWidth: 280 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Chip
                        label={`${templateSessions.length} session${templateSessions.length !== 1 ? 's' : ''}`}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      <Typography sx={{ fontSize: '0.75rem', color: '#8B9EC4' }}>
                        {selectedTemplate.positions.length} positions · {allShots.length} total shots
                      </Typography>
                    </Box>
                    {isLoading && !hasLoadedShots ? (
                      <Skeleton variant="rounded" height={160} sx={{ bgcolor: '#1E2D45' }} />
                    ) : (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Position</TableCell>
                            <TableCell align="center">Shots</TableCell>
                            <TableCell align="center">Score</TableCell>
                            <TableCell align="center">In-Box</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTemplate.positions.map((_, idx) => {
                            const stats = computePositionStats(shotsByPosition[idx] || []);
                            const color = POSITION_COLORS[idx % POSITION_COLORS.length];
                            return (
                              <TableRow key={idx}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                                    <Typography sx={{ fontSize: '0.875rem', color: '#EFF2F8' }}>
                                      Position {idx + 1}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center" sx={{ color: '#8B9EC4', fontSize: '0.875rem' }}>
                                  {stats?.count ?? 0}
                                </TableCell>
                                <TableCell align="center">
                                  {stats ? (
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor(stats.avgScore) }}>
                                      {stats.avgScore.toFixed(1)}
                                    </Typography>
                                  ) : <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>—</Typography>}
                                </TableCell>
                                <TableCell align="center">
                                  {stats ? (
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: scoreColor(stats.inBoxPct) }}>
                                      {stats.inBoxPct.toFixed(1)}%
                                    </Typography>
                                  ) : <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>—</Typography>}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {/* Overall row */}
                          {(() => {
                            const stats = computePositionStats(allShots);
                            return (
                              <TableRow sx={{ borderTop: '1px solid #1E2D45' }}>
                                <TableCell>
                                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#EFF2F8' }}>Overall</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, color: '#00E5A0', fontSize: '0.875rem' }}>
                                  {stats?.count ?? 0}
                                </TableCell>
                                <TableCell align="center">
                                  {stats ? (
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: scoreColor(stats.avgScore) }}>
                                      {stats.avgScore.toFixed(1)}
                                    </Typography>
                                  ) : <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>—</Typography>}
                                </TableCell>
                                <TableCell align="center">
                                  {stats ? (
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: scoreColor(stats.inBoxPct) }}>
                                      {stats.inBoxPct.toFixed(1)}%
                                    </Typography>
                                  ) : <Typography sx={{ color: '#4B5563', fontSize: '0.875rem' }}>—</Typography>}
                                </TableCell>
                              </TableRow>
                            );
                          })()}
                        </TableBody>
                      </Table>
                    )}
                  </Box>
                </Box>

                <Divider />

                {/* Score trend */}
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ShowChart sx={{ fontSize: 15, color: '#8B9EC4' }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#8B9EC4', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      Score Trend (per session)
                    </Typography>
                  </Box>
                  {isLoading && !hasLoadedShots ? (
                    <Skeleton variant="rounded" height={200} sx={{ bgcolor: '#1E2D45' }} />
                  ) : (
                    <PerformanceTrendChart
                      sessions={templateSessions}
                      shotDataBySessionId={shotDataBySessionId}
                      metric="score"
                      positionCount={selectedTemplate.positions.length}
                    />
                  )}
                </Box>

                <Divider />

                {/* In-box trend */}
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ShowChart sx={{ fontSize: 15, color: '#8B9EC4' }} />
                    <Typography sx={{ fontSize: '0.75rem', color: '#8B9EC4', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      In-Box Trend (per session)
                    </Typography>
                  </Box>
                  {isLoading && !hasLoadedShots ? (
                    <Skeleton variant="rounded" height={200} sx={{ bgcolor: '#1E2D45' }} />
                  ) : (
                    <PerformanceTrendChart
                      sessions={templateSessions}
                      shotDataBySessionId={shotDataBySessionId}
                      metric="inBox"
                      positionCount={selectedTemplate.positions.length}
                    />
                  )}
                </Box>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplatePerformanceSection;
