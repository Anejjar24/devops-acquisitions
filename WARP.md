# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Node.js/Express backend API for "devops-acquisitions", using:
- ESM modules with package.json `type: "module"`
- Express 5 for HTTP routing
- Drizzle ORM with Neon Postgres (`@neondatabase/serverless`)
- Zod for request validation
- Winston + morgan for logging
- JWT + httpOnly cookies for authentication

Key directory layout (under `src/`):
- `index.js` → loads environment and starts the HTTP server
- `server.js` → creates the HTTP server and binds the Express app to `PORT`
- `app.js` → Express app setup, middleware, and route mounting
- `config/` → shared configuration (database + logger)
- `routes/` → Express route definitions
- `controllers/` → HTTP handlers; call services and perform response shaping
- `services/` → business logic and database access via Drizzle
- `models/` → Drizzle schema definitions
- `utils/` → helpers (JWT, cookies, validation formatting, etc.)
- `validations/` → Zod schemas for request validation

Path aliases are configured in `package.json#imports` and used throughout the codebase, e.g. `#config/logger.js`, `#routes/auth.routes.js`, `#services/*`, etc.

## Common commands

All commands are run from the repository root.

### Development server

- Start the API in watch mode (restarts on file changes):
  - `npm run dev`

The dev server entrypoint is `src/index.js`, which loads env vars with `dotenv/config` and imports `src/server.js`. The server binds to `process.env.PORT || 3000`.

### Linting & formatting

- Lint the codebase with ESLint:
  - `npm run lint`
- Auto-fix lint issues where possible:
  - `npm run lint:fix`
- Format the codebase with Prettier:
  - `npm run format`
- Check formatting without writing changes:
  - `npm run format:check`

### Database (Drizzle + Neon)

These commands require `DATABASE_URL` to be set (e.g. via `.env`).

- Generate Drizzle migrations or artifacts based on the models:
  - `npm run db:generate`
- Apply migrations to the database:
  - `npm run db:migrate`
- Open Drizzle Studio:
  - `npm run db:studio`

### Tests

There is currently no test runner or `npm test` script configured in `package.json`. If you add a test framework (e.g. Jest, Vitest), also document the test commands and how to run a single test in this file.

## Application architecture

### Entrypoints and server lifecycle

- `src/index.js`
  - Loads environment variables via `dotenv/config`.
  - Imports `src/server.js` as the main runtime entrypoint.
- `src/server.js`
  - Imports the Express app from `src/app.js`.
  - Determines the port from `process.env.PORT || 3000`.
  - Starts the HTTP server with `app.listen(PORT, ...)`.

### Express app and middleware

Defined in `src/app.js`:
- Creates a single Express app instance.
- Global middleware stack:
  - `helmet()` for security headers.
  - `cors()` for CORS.
  - `express.json()` and `express.urlencoded({ extended: true })` for body parsing.
  - `cookie-parser` to populate `req.cookies`.
  - `morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } })` to feed access logs into the shared Winston logger.
- Health and baseline endpoints:
  - `GET /` → logs a message and returns a simple text response.
  - `GET /health` → returns a JSON payload with status/uptime (note: currently implemented without `req, res` parameters; adjust if extending).
  - `GET /api` → simple JSON message indicating the API is running.
- Feature routes:
  - Mounts authentication routes under `app.use('/api/auth', authRoutes)`.

### Configuration and logging

- `src/config/database.js`
  - Uses `@neondatabase/serverless` (`neon`) to create a SQL client, configured via `process.env.DATABASE_URL`.
  - Wraps the SQL client with Drizzle (`drizzle(sql)`) and exports `db` and `sql`.
- `src/config/logger.js`
  - Configures a Winston logger with:
    - Log level from `process.env.LOG_LEVEL || 'info'`.
    - JSON format with timestamps and error serialization.
    - File transports:
      - `logs/error.log` for `error` level and above.
      - `logs/combined.log` for `info` level and above.
  - In non-production (`NODE_ENV !== 'production'`), adds a colorized console transport.
  - Exported as the default `logger` used across the app (HTTP logging, services, controllers, etc.).

### Data model and persistence

- `src/models/user.model.js`
  - Defines a `users` table via Drizzle `pgTable` with columns: `id`, `name`, `email` (unique), `password`, `role`, `created_at`, `undated_at` (typo in name; used consistently in the schema).
  - This schema is used by services via the `db` instance in `config/database.js`.

### Authentication flow

#### Validation layer

- `src/validations/auth.validation.js`
  - `signUpSchema` (Zod): validates `name`, `email`, `password`, and `role` (enum `['user', 'admin']`, default `user`).
  - `signInSchema` (Zod): validates `email` and `password`.

#### Service layer

- `src/services/auth.service.js`
  - `hashPassword(password)`
    - Uses `bcrypt.hash` with a cost of `10`.
    - Logs and rethrows a user-friendly error on failure.
  - `createUser({ name, email, password, role = 'user' })`
    - Checks for existing users via `db.select().from(users).where(eq(users.email, email)).limit(1)`.
    - Throws an error if a user already exists.
    - Hashes the password and inserts a new row into `users`.
    - Returns a subset of fields (`id`, `name`, `email`, `role`, `created_at`).

#### Controller layer

- `src/controllers/auth.controller.js`
  - `signup(req, res, next)`:
    - Validates `req.body` using `signUpSchema.safeParse`.
    - On validation failure: returns `400` with a human-readable error message built by `formatValidationError`.
    - On success: calls `createUser`, signs a JWT token using `jwttoken.sign`, and stores it in an httpOnly cookie via `cookies.set`.
    - Logs successful registration and returns a `201` JSON response with basic user info.
    - On errors:
      - Logs via `logger.error`.
      - Distinguishes a known duplicate-user error message (409 conflict) vs forwarding other errors to Express error handling via `next(e)`.

#### Routing layer

- `src/routes/auth.routes.js`
  - `POST /api/auth/sign-up` → `signup` controller.
  - `POST /api/auth/sign-in` and `POST /api/auth/sign-out` are currently placeholders that return simple text responses.

#### Auth utilities

- `src/utils/jwt.js`
  - Reads `JWT_SECRET` from `process.env.JWT_SECRET` with a development/default fallback.
  - Exports `jwttoken` with methods:
    - `sign(payload)` → `jwt.sign` with `expiresIn: '1d'`.
    - `verify(token)` → `jwt.verify`.
  - Both methods log and throw on failure.
- `src/utils/cookies.js`
  - Exports a `cookies` helper object:
    - `getOptions()` → standard options for auth cookies (`httpOnly`, `secure` in production, `sameSite: 'strict'`, `maxAge` 15 minutes).
    - `set(res, name, value, options?)` → sets a cookie with merged default options.
    - `clear(res, name, value, options?)` → clears a cookie with default options.
    - `get(req, name)` → reads a cookie from `req.cookies`.
- `src/utils/format.js`
  - `formatValidationError(errors)` → turns Zod error objects into human-readable messages (comma-separated messages or JSON fallback).

## Environment and configuration notes

Key environment variables inferred from the codebase:
- `DATABASE_URL` → required by `src/config/database.js` for Neon/Drizzle.
- `JWT_SECRET` → secret used by JWT signing/verification; defaults to a development value if not set.
- `PORT` → optional, overrides the default HTTP port 3000.
- `NODE_ENV` → controls logger console output and cookie `secure` option.

Ensure these are configured (e.g. via `.env`) before running the dev server or database-related scripts.