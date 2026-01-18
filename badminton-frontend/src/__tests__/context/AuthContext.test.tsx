import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { ReactNode } from 'react';

// Mock API
jest.mock('../../utils/api', () => ({
  api: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

import { api } from '../../utils/api';

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');

    consoleError.mockRestore();
  });

  it('should initialize with null user and not authenticated', async () => {
    (api.getCurrentUser as jest.Mock).mockResolvedValue({ success: false });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should restore user session from localStorage on mount', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
    };

    localStorage.setItem('token', 'jwt_token_12345');
    (api.getCurrentUser as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should remove invalid token from localStorage on mount', async () => {
    localStorage.setItem('token', 'invalid_token');
    (api.getCurrentUser as jest.Mock).mockResolvedValue({ success: false });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  it('should login successfully and store token', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
    };

    (api.getCurrentUser as jest.Mock).mockResolvedValue({ success: false });
    (api.login as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
      token: 'jwt_token_12345',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(api.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(localStorage.getItem('token')).toBe('jwt_token_12345');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login failure', async () => {
    (api.getCurrentUser as jest.Mock).mockResolvedValue({ success: false });
    (api.login as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      })
    ).rejects.toThrow('Invalid credentials');

    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should register successfully and store token', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
    };

    (api.getCurrentUser as jest.Mock).mockResolvedValue({ success: false });
    (api.register as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
      token: 'jwt_token_12345',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register('test@example.com', 'testuser', 'password123');
    });

    expect(api.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });
    expect(localStorage.getItem('token')).toBe('jwt_token_12345');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle registration failure', async () => {
    (api.getCurrentUser as jest.Mock).mockResolvedValue({ success: false });
    (api.register as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Email already exists',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.register('test@example.com', 'testuser', 'password123');
      })
    ).rejects.toThrow('Email already exists');

    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should logout and remove token', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
    };

    localStorage.setItem('token', 'jwt_token_12345');
    (api.getCurrentUser as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
    });
    (api.logout as jest.Mock).mockResolvedValue({ success: true });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(api.logout).toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should remove token even if logout API fails', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
    };

    localStorage.setItem('token', 'jwt_token_12345');
    (api.getCurrentUser as jest.Mock).mockResolvedValue({
      success: true,
      user: mockUser,
    });
    (api.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await result.current.logout();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    consoleError.mockRestore();
  });
});
