import React from 'react';
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
} from '@mui/material';
import { Person, AddCircle } from '@mui/icons-material';

interface Athlete {
  id: string;
  athlete_name: string;
  skill_level: string;
}

interface AthleteSelectorProps {
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  isTrainingActive: boolean;
  onAthleteChange: (athleteId: string) => void;
  onNavigateToAthletes: () => void;
}

/**
 * EXTRACTED COMPONENT: Athlete Selection
 *
 * Responsibilities:
 * - Display athlete dropdown
 * - Show selected athlete info
 * - Navigate to athlete management
 *
 * Optimization: Memoized to prevent re-render when unrelated state changes
 */
const AthleteSelector: React.FC<AthleteSelectorProps> = ({
  athletes,
  selectedAthlete,
  isTrainingActive,
  onAthleteChange,
  onNavigateToAthletes,
}) => {
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'default';
      case 'intermediate':
        return 'primary';
      case 'advanced':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
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
            onClick={onNavigateToAthletes}
          >
            New Athlete
          </Button>
        </Box>

        <FormControl fullWidth>
          <InputLabel>Select Athlete</InputLabel>
          <Select
            value={selectedAthlete?.id || ''}
            onChange={(e) => onAthleteChange(e.target.value)}
            disabled={isTrainingActive}
          >
            {athletes.map((athlete) => (
              <MenuItem key={athlete.id} value={athlete.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {athlete.athlete_name}
                  <Chip
                    label={athlete.skill_level}
                    size="small"
                    color={getSkillLevelColor(athlete.skill_level)}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedAthlete && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Selected: <strong>{selectedAthlete.athlete_name}</strong> ({selectedAthlete.skill_level}{' '}
            level)
          </Alert>
        )}

        {athletes.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No athletes found. Create your first athlete to begin.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(AthleteSelector);
