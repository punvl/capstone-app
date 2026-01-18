import React, { useRef, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Shot, ShotData } from '../types';

interface CourtVisualizationProps {
  mode: 'live' | 'review';
  currentShot?: ShotData;
  shots?: Shot[];
  width?: number;
  height?: number;
  showLabels?: boolean;
}

// Standard badminton court dimensions (meters)
const COURT_LENGTH = 13.4;
const COURT_WIDTH = 6.1;

const CourtVisualization: React.FC<CourtVisualizationProps> = ({
  mode,
  currentShot,
  shots = [],
  width = 600,
  height = 400,
  showLabels = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate scale factors
  const padding = 40;
  const scaleX = (width - padding * 2) / COURT_LENGTH;
  const scaleY = (height - padding * 2) / COURT_WIDTH;

  // Convert court coordinates to SVG coordinates
  const toSvgX = (courtX: number | string) => padding + Number(courtX) * scaleX;
  const toSvgY = (courtY: number | string) => padding + Number(courtY) * scaleY;

  const getShotColor = (accuracyCm: number | string) => {
    const accuracy = Number(accuracyCm);
    if (accuracy < 20) return '#4caf50'; // Green - excellent
    if (accuracy < 50) return '#ff9800'; // Orange - good
    return '#f44336'; // Red - needs improvement
  };

  useEffect(() => {
    // Add pulsing animation for live mode
    if (mode === 'live' && currentShot) {
      // Animation handled by CSS
    }
  }, [mode, currentShot]);

  return (
    <Box sx={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '2px solid #e0e0e0', borderRadius: '8px', background: '#f5f5f5' }}
      >
        {/* Court surface */}
        <rect
          x={padding}
          y={padding}
          width={width - padding * 2}
          height={height - padding * 2}
          fill="#E8F5E9"
          stroke="#2e7d32"
          strokeWidth="3"
        />

        {/* Net line (center) */}
        <line
          x1={toSvgX(COURT_LENGTH / 2)}
          y1={padding}
          x2={toSvgX(COURT_LENGTH / 2)}
          y2={height - padding}
          stroke="#666"
          strokeWidth="3"
          strokeDasharray="5,5"
        />

        {/* Service lines */}
        {/* Short service line (both sides) */}
        <line
          x1={toSvgX(1.98)}
          y1={padding}
          x2={toSvgX(1.98)}
          y2={height - padding}
          stroke="white"
          strokeWidth="2"
        />
        <line
          x1={toSvgX(COURT_LENGTH - 1.98)}
          y1={padding}
          x2={toSvgX(COURT_LENGTH - 1.98)}
          y2={height - padding}
          stroke="white"
          strokeWidth="2"
        />

        {/* Long service line (doubles) */}
        <line
          x1={toSvgX(0.76)}
          y1={padding}
          x2={toSvgX(0.76)}
          y2={height - padding}
          stroke="white"
          strokeWidth="2"
        />
        <line
          x1={toSvgX(COURT_LENGTH - 0.76)}
          y1={padding}
          x2={toSvgX(COURT_LENGTH - 0.76)}
          y2={height - padding}
          stroke="white"
          strokeWidth="2"
        />

        {/* Center line (dividing left/right service courts) */}
        <line
          x1={padding}
          y1={toSvgY(COURT_WIDTH / 2)}
          x2={width - padding}
          y2={toSvgY(COURT_WIDTH / 2)}
          stroke="white"
          strokeWidth="2"
        />

        {/* Singles sidelines */}
        <line
          x1={padding}
          y1={toSvgY(0.46)}
          x2={width - padding}
          y2={toSvgY(0.46)}
          stroke="white"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={toSvgY(COURT_WIDTH - 0.46)}
          x2={width - padding}
          y2={toSvgY(COURT_WIDTH - 0.46)}
          stroke="white"
          strokeWidth="2"
        />

        {/* Review mode: Show all shots */}
        {mode === 'review' &&
          shots.map((shot, index) => {
            const targetX = toSvgX(shot.target_position_x);
            const targetY = toSvgY(shot.target_position_y);
            const landingX = toSvgX(shot.landing_position_x);
            const landingY = toSvgY(shot.landing_position_y);
            const color = getShotColor(shot.accuracy_cm);

            return (
              <g key={shot.id}>
                {/* Accuracy line */}
                <line
                  x1={targetX}
                  y1={targetY}
                  x2={landingX}
                  y2={landingY}
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />

                {/* Target position */}
                <g>
                  <circle cx={targetX} cy={targetY} r="8" fill="none" stroke="#1976d2" strokeWidth="2" />
                  <line x1={targetX - 10} y1={targetY} x2={targetX + 10} y2={targetY} stroke="#1976d2" strokeWidth="2" />
                  <line x1={targetX} y1={targetY - 10} x2={targetX} y2={targetY + 10} stroke="#1976d2" strokeWidth="2" />
                </g>

                {/* Landing position */}
                <circle cx={landingX} cy={landingY} r="6" fill={color} opacity="0.8" />

                {/* Shot number label */}
                {showLabels && (
                  <text
                    x={landingX + 10}
                    y={landingY - 10}
                    fontSize="10"
                    fill="#333"
                    fontWeight="bold"
                  >
                    #{shot.shot_number}
                  </text>
                )}
              </g>
            );
          })}

        {/* Live mode: Show current shot with animation */}
        {mode === 'live' && currentShot && (
          <g className="live-shot">
            {/* Target position */}
            <g>
              <circle
                cx={toSvgX(currentShot.targetPosition.x)}
                cy={toSvgY(currentShot.targetPosition.y)}
                r="10"
                fill="none"
                stroke="#1976d2"
                strokeWidth="3"
              />
              <line
                x1={toSvgX(currentShot.targetPosition.x) - 12}
                y1={toSvgY(currentShot.targetPosition.y)}
                x2={toSvgX(currentShot.targetPosition.x) + 12}
                y2={toSvgY(currentShot.targetPosition.y)}
                stroke="#1976d2"
                strokeWidth="3"
              />
              <line
                x1={toSvgX(currentShot.targetPosition.x)}
                y1={toSvgY(currentShot.targetPosition.y) - 12}
                x2={toSvgX(currentShot.targetPosition.x)}
                y2={toSvgY(currentShot.targetPosition.y) + 12}
                stroke="#1976d2"
                strokeWidth="3"
              />
            </g>

            {/* Accuracy line */}
            <line
              x1={toSvgX(currentShot.targetPosition.x)}
              y1={toSvgY(currentShot.targetPosition.y)}
              x2={toSvgX(currentShot.landingPosition.x)}
              y2={toSvgY(currentShot.landingPosition.y)}
              stroke={getShotColor(currentShot.accuracy)}
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Landing position with pulsing animation */}
            <circle
              cx={toSvgX(currentShot.landingPosition.x)}
              cy={toSvgY(currentShot.landingPosition.y)}
              r="10"
              fill={getShotColor(currentShot.accuracy)}
              opacity="0.8"
            >
              <animate
                attributeName="r"
                values="10;15;10"
                dur="1s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.8;0.4;0.8"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Shot info */}
            <text
              x={toSvgX(currentShot.landingPosition.x) + 15}
              y={toSvgY(currentShot.landingPosition.y)}
              fontSize="12"
              fill="#333"
              fontWeight="bold"
            >
              #{currentShot.shotNumber}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      {mode === 'review' && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4caf50' }} />
            <Typography variant="caption">&lt; 20cm (Excellent)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#ff9800' }} />
            <Typography variant="caption">20-50cm (Good)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#f44336' }} />
            <Typography variant="caption">&gt; 50cm (Needs Improvement)</Typography>
          </Box>
        </Box>
      )}

      {/* Live shot info */}
      {mode === 'live' && currentShot && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Current Shot: #{currentShot.shotNumber}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Accuracy: ${currentShot.accuracy.toFixed(1)} cm`}
              color={currentShot.accuracy < 20 ? 'success' : currentShot.accuracy < 50 ? 'warning' : 'error'}
            />
            {currentShot.velocity && (
              <Chip label={`Velocity: ${currentShot.velocity.toFixed(1)} km/h`} />
            )}
            <Chip
              label={`Target: (${currentShot.targetPosition.x.toFixed(1)}m, ${currentShot.targetPosition.y.toFixed(1)}m)`}
              variant="outlined"
            />
            <Chip
              label={`Landing: (${currentShot.landingPosition.x.toFixed(1)}m, ${currentShot.landingPosition.y.toFixed(1)}m)`}
              variant="outlined"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CourtVisualization;

