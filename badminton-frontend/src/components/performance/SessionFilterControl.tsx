import React from 'react';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FilterList } from '@mui/icons-material';

export type SessionFilter = 'all' | 'latest5' | 'latest10' | 'latest20';

interface SessionFilterControlProps {
  value: SessionFilter;
  onChange: (value: SessionFilter) => void;
  totalCount: number;
}

const FILTER_OPTIONS: { value: SessionFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'latest5', label: 'Latest 5' },
  { value: 'latest10', label: 'Latest 10' },
  { value: 'latest20', label: 'Latest 20' },
];

const SessionFilterControl: React.FC<SessionFilterControlProps> = ({ value, onChange, totalCount }) => {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: SessionFilter | null) => {
    if (newValue) onChange(newValue);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <FilterList sx={{ color: '#8B9EC4', fontSize: 16 }} />
        <Typography sx={{ fontSize: '0.8rem', color: '#8B9EC4', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Sessions
        </Typography>
      </Box>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          '& .MuiToggleButton-root': {
            color: '#8B9EC4',
            borderColor: '#2A3A5C',
            fontSize: '0.75rem',
            px: 1.5,
            py: 0.5,
            '&.Mui-selected': {
              color: '#00E5A0',
              backgroundColor: '#00E5A015',
              borderColor: '#00E5A040',
            },
          },
        }}
      >
        {FILTER_OPTIONS.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Typography sx={{ fontSize: '0.75rem', color: '#4B5563' }}>
        {totalCount} session{totalCount !== 1 ? 's' : ''}
      </Typography>
    </Box>
  );
};

export default SessionFilterControl;
