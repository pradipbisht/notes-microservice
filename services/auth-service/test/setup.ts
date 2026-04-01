import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// If no .env.test, fall back to .env
if (!process.env.NODE_ENV) {
  dotenv.config();
}

// Set test environment
process.env.NODE_ENV = "test";

// Mock console methods to reduce noise during tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // Keep log and warn for debugging, but silence info
  info: jest.fn(),
  debug: jest.fn(),
};

// Clean up after all tests
afterAll(async () => {
  // Restore console
  global.console = originalConsole;
  // Close database connections
  const { disconnectDatabase } = await import("../src/database");
  await disconnectDatabase();
});
