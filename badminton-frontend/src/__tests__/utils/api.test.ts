import { api } from '../../utils/api';

// Mock fetch
global.fetch = jest.fn();

describe('API Utilities', () => {
  const API_BASE_URL = 'http://localhost:5000/api';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Auth endpoints', () => {
    it('should register user', async () => {
      const mockResponse = {
        success: true,
        user: { id: 'user-1', email: 'test@example.com', username: 'testuser' },
        token: 'jwt_token',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.register({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should login user', async () => {
      const mockResponse = {
        success: true,
        user: { id: 'user-1', email: 'test@example.com', username: 'testuser' },
        token: 'jwt_token',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should logout user with auth token', async () => {
      localStorage.setItem('token', 'jwt_token');

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: true }),
      });

      await api.logout();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
      });
    });

    it('should get current user with auth token', async () => {
      localStorage.setItem('token', 'jwt_token');

      const mockResponse = {
        success: true,
        user: { id: 'user-1', email: 'test@example.com', username: 'testuser' },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Athlete endpoints', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'jwt_token');
    });

    it('should get all athletes', async () => {
      const mockResponse = {
        success: true,
        athletes: [
          { id: 'athlete-1', name: 'John Doe' },
          { id: 'athlete-2', name: 'Jane Smith' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.getAthletes();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/athletes`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should get athlete by id', async () => {
      const mockResponse = {
        success: true,
        athlete: { id: 'athlete-1', name: 'John Doe' },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.getAthlete('athlete-1');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/athletes/athlete-1`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should create athlete', async () => {
      const athleteData = {
        name: 'New Athlete',
        date_of_birth: '2000-01-01',
        gender: 'male',
        skill_level: 'intermediate',
        dominant_hand: 'right',
      };

      const mockResponse = {
        success: true,
        athlete: { id: 'athlete-3', ...athleteData },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.createAthlete(athleteData);

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/athletes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
        body: JSON.stringify(athleteData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update athlete', async () => {
      const updateData = { name: 'Updated Name' };

      const mockResponse = {
        success: true,
        athlete: { id: 'athlete-1', name: 'Updated Name' },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.updateAthlete('athlete-1', updateData);

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/athletes/athlete-1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should delete athlete', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.deleteAthlete('athlete-1');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/athletes/athlete-1`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Session endpoints', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'jwt_token');
    });

    it('should start session', async () => {
      const mockResponse = {
        success: true,
        session: {
          id: 'session-1',
          athlete_id: 'athlete-1',
          coach_id: 'coach-1',
          start_time: new Date().toISOString(),
          status: 'active',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.startSession({
        athleteId: 'athlete-1',
        targetZone: 'forehand',
      });

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
        body: JSON.stringify({
          athleteId: 'athlete-1',
          targetZone: 'forehand',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should stop session with notes and rating', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.stopSession('session-1', {
        sessionNotes: 'Great session',
        sessionRating: 5,
      });

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/sessions/session-1/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
        body: JSON.stringify({
          sessionNotes: 'Great session',
          sessionRating: 5,
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should get sessions with pagination', async () => {
      const mockResponse = {
        success: true,
        sessions: [
          { id: 'session-1', athlete_id: 'athlete-1' },
          { id: 'session-2', athlete_id: 'athlete-2' },
        ],
        pagination: {
          total: 2,
          limit: 10,
          offset: 0,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.getSessions({ limit: 10, offset: 0 });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/sessions?limit=10&offset=0`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer jwt_token',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should get session by id', async () => {
      const mockResponse = {
        success: true,
        session: {
          id: 'session-1',
          athlete_id: 'athlete-1',
          shots: [{ id: 'shot-1' }, { id: 'shot-2' }],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const result = await api.getSession('session-1');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/sessions/session-1`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token',
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Authorization headers', () => {
    it('should not include Authorization header when no token', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: true }),
      });

      await api.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should include Authorization header when token exists', async () => {
      localStorage.setItem('token', 'jwt_token_12345');

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ success: true }),
      });

      await api.getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer jwt_token_12345',
        },
      });
    });
  });
});
