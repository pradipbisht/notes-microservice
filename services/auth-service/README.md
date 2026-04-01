# Auth Service

A microservice for user authentication and authorization built with Node.js, Express, TypeScript, and Prisma.

## Features

- User registration and login
- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- PostgreSQL database with Prisma ORM
- Input validation with Joi
- CORS and security headers with Helmet
- Request logging with Morgan

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Docker (for running the database)

## Setup

1. **Clone the repository and navigate to the auth-service directory:**

   ```bash
   cd services/auth-service
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up the database:**

   Start the PostgreSQL database using Docker Compose from the root directory:

   ```bash
   docker-compose up -d postgres
   ```

4. **Configure environment variables:**

   Copy the `.env` file and update the values as needed:

   ```env
   PORT=3001
   DATABASE_URL="postgresql://notesverb:notesverb123@localhost:5433/notesverb?schema=public"
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   ```

5. **Run database migrations:**

   ```bash
   npm run prisma:migrate
   ```

6. **Generate Prisma client:**

   ```bash
   npm run prisma:generate
   ```

7. **Start the development server:**

   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3001`.

## API Endpoints

### Register User

- **POST** `/auth/register`
- **Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Response:** JWT tokens

### Login User

- **POST** `/auth/login`
- **Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Response:** JWT tokens

### Health Check

- **GET** `/health`
- **Response:** Service status

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
src/
├── auth.controller.ts    # Route handlers
├── auth.route.ts         # Route definitions
├── authService.ts        # Business logic
├── database.ts           # Database connection
├── index.ts              # Server entry point
├── lib/
│   └── prisma.ts         # Prisma client instance
├── validation.ts         # Input validation schemas
prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Joi** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

## Development

### Prisma Setup Issues

If you encounter the error `PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl"`, this is because Prisma 7+ defaults to the "client" engine which requires a database adapter.

**Solution:**

1. Install the PostgreSQL adapter:

   ```bash
   npm install @prisma/adapter-pg @types/pg
   ```

2. Update `src/database.ts` to use the adapter:

   ```typescript
   import { Pool } from "pg";
   import { PrismaPg } from "@prisma/adapter-pg";

   const connectionString = process.env.DATABASE_URL;
   const pool = new Pool({ connectionString });
   const adapter = new PrismaPg(pool);

   const prisma = new PrismaClient({ adapter });
   ```

3. Ensure all required environment variables are set in `.env`

4. Add `dotenv.config()` at the top of files that need environment variables before any other imports.

### Environment Variables

Make sure all required environment variables are defined:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_ROUNDS`
- `DATABASE_URL`

## Testing

The service includes comprehensive tests using Jest and Supertest. See [TESTING.md](TESTING.md) for detailed testing documentation.

### Quick Test Setup

1. Create test database:

   ```sql
   CREATE DATABASE notesverb_test;
   ```

2. Run migrations on test database:

   ```bash
   npm run prisma:migrate
   ```

3. Run tests:
   ```bash
   npm test
   ```
