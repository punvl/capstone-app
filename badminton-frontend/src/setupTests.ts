// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock socket.io-client globally
// Create a persistent mock socket that will be reused across tests
const mockSocket = {
  on: jest.fn(() => mockSocket),
  off: jest.fn(() => mockSocket),
  emit: jest.fn(() => mockSocket),
  close: jest.fn(() => mockSocket),
};

// Reset mock socket between tests
beforeEach(() => {
  mockSocket.on.mockClear();
  mockSocket.off.mockClear();
  mockSocket.emit.mockClear();
  mockSocket.close.mockClear();
});

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => mockSocket),
}));
