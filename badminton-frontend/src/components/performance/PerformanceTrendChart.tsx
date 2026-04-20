import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Box, Typography } from '@mui/material';
import { TrainingSession, Shot, TargetTemplate } from '../../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export type TrendMetric = 'accuracy' | 'inBox';
export type TrendMode = 'by-position' | 'by-template';

interface PerformanceTrendChartProps {
  sessions: TrainingSession[];
  shotDataBySessionId: Record<string, Shot[]>;
  metric?: TrendMetric;
  // by-position mode
  positionCount?: number;
  // by-template mode
  mode?: TrendMode;
  templates?: TargetTemplate[];
}

const POSITION_COLORS = ['#60A5FA', '#00E5A0', '#F59E0B', '#A78BFA', '#F87171'];
const OVERALL_COLOR = '#EFF2F8';
const TEMPLATE_COLORS = ['#60A5FA', '#00E5A0', '#F59E0B'];

function extractMetricValue(shots: Shot[], metric: TrendMetric): number | null {
  if (shots.length === 0) return null;
  if (metric === 'accuracy') {
    const valid = shots.filter((s) => s.accuracy_percent != null);
    return valid.length > 0 ? valid.reduce((sum, s) => sum + Number(s.accuracy_percent), 0) / valid.length : null;
  }
  // inBox
  const valid = shots.filter((s) => s.in_box != null);
  return valid.length > 0 ? (valid.filter((s) => s.in_box).length / valid.length) * 100 : null;
}

const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  sessions,
  shotDataBySessionId,
  metric = 'accuracy',
  mode = 'by-position',
  positionCount = 0,
  templates,
}) => {
  const chartData = useMemo(() => {
    const completed = [...sessions]
      .filter((s) => s.status === 'completed')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    if (completed.length === 0) return null;

    const formatLabel = (s: TrainingSession) =>
      new Date(s.start_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    if (mode === 'by-template' && templates && templates.length > 0) {
      // All sessions on shared X axis; one line per template
      const withShots = completed.filter((s) => s.template_id && shotDataBySessionId[s.id]);
      if (withShots.length === 0) return null;

      const labels = withShots.map(formatLabel);

      const datasets = templates.map((t, i) => ({
        label: t.name,
        data: withShots.map((s) => {
          if (s.template_id !== t.id) return null;
          return extractMetricValue(shotDataBySessionId[s.id] || [], metric);
        }),
        borderColor: TEMPLATE_COLORS[i % TEMPLATE_COLORS.length],
        backgroundColor: `${TEMPLATE_COLORS[i % TEMPLATE_COLORS.length]}20`,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        spanGaps: true,
      }));

      return { labels, datasets };
    }

    // by-position mode (default)
    const withShots = completed.filter((s) => shotDataBySessionId[s.id]);
    if (withShots.length === 0) return null;

    const labels = withShots.map(formatLabel);

    const positionDatasets = Array.from({ length: positionCount }, (_, idx) => ({
      label: `Position ${idx + 1}`,
      data: withShots.map((s) => {
        const shots = (shotDataBySessionId[s.id] || []).filter((sh) => sh.target_position_index === idx);
        return extractMetricValue(shots, metric);
      }),
      borderColor: POSITION_COLORS[idx % POSITION_COLORS.length],
      backgroundColor: `${POSITION_COLORS[idx % POSITION_COLORS.length]}20`,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.3,
      spanGaps: true,
    }));

    const overallDataset = {
      label: 'Overall',
      data: withShots.map((s) => extractMetricValue(shotDataBySessionId[s.id] || [], metric)),
      borderColor: OVERALL_COLOR,
      backgroundColor: `${OVERALL_COLOR}20`,
      borderDash: [5, 3],
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.3,
      spanGaps: true,
    };

    return { labels, datasets: [...positionDatasets, overallDataset] };
  }, [sessions, shotDataBySessionId, metric, mode, positionCount, templates]);

  if (!chartData) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography sx={{ color: '#4B5563', fontSize: '0.8rem' }}>
          Not enough session data to show trends
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: 300 }}>
      <Line
        data={chartData as any}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#8B9EC4', font: { size: 11 }, padding: 12, boxWidth: 12 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.dataset.label}: ${ctx.parsed.y != null ? ctx.parsed.y.toFixed(1) + '%' : 'N/A'}`,
              },
            },
          },
          scales: {
            x: {
              ticks: { color: '#8B9EC4', font: { size: 11 } },
              grid: { color: '#1E2D4530' },
            },
            y: {
              min: 0,
              max: 100,
              ticks: { color: '#8B9EC4', font: { size: 11 }, callback: (v) => `${v}%` },
              grid: { color: '#1E2D4550' },
            },
          },
        }}
      />
    </Box>
  );
};

export default PerformanceTrendChart;
