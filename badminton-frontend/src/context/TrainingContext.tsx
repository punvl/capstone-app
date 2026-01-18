import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Athlete, TrainingSession, Shot, ShotData } from '../types';
import { api } from '../utils/api';

interface TrainingContextType {
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  currentSession: TrainingSession | null;
  isTrainingActive: boolean;
  liveCourtData: ShotData | null;
  loadAthletes: () => Promise<void>;
  createAthlete: (data: any) => Promise<void>;
  updateAthlete: (id: string, data: any) => Promise<void>;
  deleteAthlete: (id: string) => Promise<void>;
  selectAthlete: (athlete: Athlete) => void;
  startTraining: () => Promise<void>;
  stopTraining: () => Promise<void>;
  saveSession: (notes?: string, rating?: number) => Promise<void>;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within TrainingProvider');
  }
  return context;
};

interface TrainingProviderProps {
  children: ReactNode;
}

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const TrainingProvider: React.FC<TrainingProviderProps> = ({ children }) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [liveCourtData, setLiveCourtData] = useState<ShotData | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Listen for shot data
  useEffect(() => {
    if (!socket || !currentSession) return;

    socket.on('shot_received', (shot: Shot) => {
      console.log('Shot received:', shot);
      setLiveCourtData({
        shotNumber: shot.shot_number,
        timestamp: shot.timestamp,
        targetPosition: {
          x: shot.target_position_x,
          y: shot.target_position_y,
        },
        landingPosition: {
          x: shot.landing_position_x,
          y: shot.landing_position_y,
        },
        velocity: shot.velocity_kmh,
        accuracy: shot.accuracy_cm,
      });
    });

    socket.on('session_stats_updated', (stats: any) => {
      console.log('Session stats updated:', stats);
      // Update the current session with the new stats
      if (currentSession && stats) {
        setCurrentSession({
          ...currentSession,
          total_shots: stats.total_shots || currentSession.total_shots,
          successful_shots: stats.successful_shots || currentSession.successful_shots,
          average_accuracy_percent: stats.average_accuracy_percent,
          average_shot_velocity_kmh: stats.average_shot_velocity_kmh,
        });
      }
    });

    socket.on('session_ended', () => {
      console.log('Session ended');
      setIsTrainingActive(false);
    });

    return () => {
      socket.off('shot_received');
      socket.off('session_stats_updated');
      socket.off('session_ended');
    };
  }, [socket, currentSession]);

  const loadAthletes = async () => {
    try {
      const result = await api.getAthletes();
      if (result.success) {
        setAthletes(result.athletes);
      }
    } catch (error) {
      console.error('Failed to load athletes:', error);
    }
  };

  const createAthlete = async (data: any) => {
    try {
      const result = await api.createAthlete(data);
      if (result.success) {
        await loadAthletes();
      }
    } catch (error) {
      console.error('Failed to create athlete:', error);
      throw error;
    }
  };

  const updateAthlete = async (id: string, data: any) => {
    try {
      const result = await api.updateAthlete(id, data);
      if (result.success) {
        await loadAthletes();
      }
    } catch (error) {
      console.error('Failed to update athlete:', error);
      throw error;
    }
  };

  const deleteAthlete = async (id: string) => {
    try {
      await api.deleteAthlete(id);
      await loadAthletes();
    } catch (error) {
      console.error('Failed to delete athlete:', error);
      throw error;
    }
  };

  const selectAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
  };

  const startTraining = async () => {
    if (!selectedAthlete) {
      throw new Error('No athlete selected');
    }

    try {
      const result = await api.startSession({
        athleteId: selectedAthlete.id,
      });

      if (result.success) {
        setCurrentSession(result.session);
        setIsTrainingActive(true);
        setLiveCourtData(null);

        // Join socket room
        if (socket) {
          socket.emit('join_session', result.session.id);
        }
      }
    } catch (error) {
      console.error('Failed to start training:', error);
      throw error;
    }
  };

  const stopTraining = async () => {
    if (!currentSession) return;

    setIsTrainingActive(false);

    // Leave socket room
    if (socket) {
      socket.emit('leave_session', currentSession.id);
    }
  };

  const saveSession = async (notes?: string, rating?: number) => {
    if (!currentSession) {
      console.warn('No current session to save');
      // Still clear state even if no currentSession
      setCurrentSession(null);
      setLiveCourtData(null);
      setIsTrainingActive(false);
      return;
    }

    try {
      await api.stopSession(currentSession.id, {
        sessionNotes: notes,
        sessionRating: rating,
      });

      setCurrentSession(null);
      setLiveCourtData(null);
      setIsTrainingActive(false);
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  };

  const value: TrainingContextType = {
    athletes,
    selectedAthlete,
    currentSession,
    isTrainingActive,
    liveCourtData,
    loadAthletes,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    selectAthlete,
    startTraining,
    stopTraining,
    saveSession,
  };

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
};

