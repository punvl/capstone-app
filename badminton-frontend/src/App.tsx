import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { TrainingProvider } from './context/TrainingContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import Navigation from './components/Navigation';
import TrainingControl from './components/TrainingControl';
import PerformanceDashboard from './components/PerformanceDashboard';
import AthleteManagement from './components/AthleteManagement';
import SessionDetail from './components/SessionDetail';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TrainingProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <TrainingControl />
                    </Box>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/performance"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <PerformanceDashboard />
                    </Box>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/athletes"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <AthleteManagement />
                    </Box>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/session/:sessionId"
                element={
                  <ProtectedRoute>
                    <Box>
                      <Navigation />
                      <SessionDetail />
                    </Box>
                  </ProtectedRoute>
                }
              />

              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </TrainingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
