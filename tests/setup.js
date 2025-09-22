// Jest setup file
const { TextEncoder, TextDecoder } = require('util');

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch for i18n tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      'app.title': 'Test Title',
      'matrix.quadrants.urgent_important': 'Do First'
    }),
  })
);

// Mock DOM elements for tests that need them
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    hostname: 'localhost',
    port: '3000',
    protocol: 'http:',
  },
  writable: true,
});

// Mock console methods to reduce test noise
global.console = {
  ...console,
  // Suppress console.warn and console.error in tests unless needed
  warn: jest.fn(),
  error: jest.fn(),
  log: console.log, // Keep log for debugging
};

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

// Global test helpers
global.testHelpers = {
  createMockTask: (overrides = {}) => ({
    id: 'test-' + Math.random().toString(36).substr(2, 9),
    name: 'Test Task',
    description: 'Test Description',
    importance: 3,
    urgency: 3,
    created: new Date('2024-01-01'),
    updated: new Date('2024-01-01'),
    completed: false,
    battleScore: 0,
    ...overrides
  }),

  createMockMatrix: () => ({
    tasks: new Map(),
    eventHandlers: new Map(),
  }),

  mockI18nTranslations: {
    en: {
      'app.title': 'Priority Matrix',
      'matrix.quadrants.urgent_important': 'Do First',
      'matrix.quadrants.not_urgent_important': 'Schedule',
      'matrix.quadrants.urgent_not_important': 'Delegate',
      'matrix.quadrants.not_urgent_not_important': 'Eliminate',
      'buttons.save': 'Save',
      'buttons.cancel': 'Cancel',
    }
  }
};