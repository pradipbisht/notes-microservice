# Testing Guide for Auth Service

This guide explains how to set up and run tests for the authentication service.

## Overview

The auth service uses **Jest** as the testing framework with **ts-jest** for TypeScript support. Tests are organized into unit tests for services and integration tests for API endpoints.

## Test Structure

```
test/
├── setup.ts              # Test environment setup
├── authService.test.ts   # Unit tests for AuthService
└── authRoutes.test.ts    # Integration tests for API routes
```

## Setup

### Prerequisites

- Node.js and npm installed
- PostgreSQL database running
- Test database configured

### Environment Configuration

Tests use a separate `.env.test` file to avoid interfering with development/production data:

```env
PORT=3002
DATABASE_URL="postgresql://notesverb:notesverb123@localhost:5433/notesverb_test"
NODE_ENV=test
JWT_SECRET=test_access_secret
JWT_REFRESH_SECRET=test_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=1
```

### Database Setup

Create a test database in PostgreSQL:

```sql
CREATE DATABASE notesverb_test;
```

Run migrations on the test database:

```bash
npm run prisma:migrate
```

Generate Prisma client:

```bash
npm run prisma:generate
```

## Running Tests

### Run All Tests

```bash
npm test
```

**Current Status**: All 16 tests pass and Jest exits cleanly without hanging.

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test authService.test.ts
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## Test Types

### Unit Tests (`authService.test.ts`)

Test individual service methods in isolation:

- **register()**: User registration with validation
- **login()**: Authentication with password verification
- **validateToken()**: JWT token validation
- **getUserById()**: User data retrieval
- **refreshToken()**: Token refresh functionality
- **logout()**: Token invalidation

### Integration Tests (`authRoutes.test.ts`)

Test complete API endpoints using Supertest:

- **POST /auth/register**: User registration endpoint
- **POST /auth/login**: User login endpoint
- **GET /auth/validate-token**: Token validation endpoint
- **GET /auth/profile**: Protected profile endpoint

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  moduleNameMapping: {
    "^generated/(.*)$": "<rootDir>/generated/$1",
    "^@shared/(.*)$": "<rootDir>/../../shared/$1",
  },
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
};
```

### Test Setup (`test/setup.ts`)

- Loads test environment variables from `.env.test`
- Mocks console methods to reduce noise during testing
- Sets up test database connections
- Automatically disconnects database connections after all tests complete

## Writing Tests

### Unit Test Example

```typescript
describe("AuthService", () => {
  let authService: AuthService;

  beforeAll(async () => {
    authService = new AuthService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  it("should register a new user", async () => {
    const result = await authService.register("test@example.com", "password");

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });
});
```

### Integration Test Example

```typescript
import request from "supertest";
import app from "../src/app"; // Your Express app

describe("Auth Routes", () => {
  it("should register a user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
      })
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

## Best Practices

### Test Organization

- Use `describe` blocks to group related tests
- Use `beforeAll`, `afterAll`, `beforeEach`, `afterEach` for setup/cleanup
- Name tests descriptively with `it("should do something")`

### Database Testing

- Clean database state between tests
- Use test-specific data to avoid conflicts
- Test both success and error scenarios

### Mocking

- Mock external dependencies when possible
- Use Jest's mocking utilities for complex integrations
- Avoid mocking when testing real database interactions

### Assertions

- Test the expected behavior, not implementation details
- Check response structure and data types
- Verify error handling with appropriate status codes

## Coverage

Tests aim for high code coverage:

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 90%
- **Lines**: > 80%

Coverage reports are generated in the `coverage/` directory.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure test database exists and is accessible
   - Check DATABASE_URL in `.env.test`

2. **Timeout Errors**
   - Increase `testTimeout` in jest config
   - Check for slow database operations

3. **Import Errors**
   - Ensure all dependencies are installed
   - Check TypeScript compilation

4. **Environment Variables**
   - Verify `.env.test` exists and has correct values
   - Check that setup.ts loads the correct env file

### Debugging Tests

- Use `console.log` in tests (not mocked in setup)
- Run tests with `--verbose` flag
- Use Jest's `--testNamePattern` to run specific tests
- Check coverage reports for untested code

## CI/CD Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve code coverage
4. Update this documentation if needed

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Express Apps](https://expressjs.com/en/guide/testing.html)
