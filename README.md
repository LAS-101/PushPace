# PushPace

Track walking, running and gym workouts, with calorie estimates based on your profile.

https://github.com/user-attachments/assets/92e2cb7c-b51f-4d91-a992-95068aae07cf

## Tech stack

| Part      | Technology                                                              |
| --------- | ----------------------------------------------------------------------- |
| Backend   | [NestJS 12](https://nestjs.com) + TypeScript, TypeORM, Zod validation    |
| Frontend  | [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript    |
| Database  | MySQL 8 (or MariaDB / XAMPP's MySQL)                                     |
| Auth      | bcrypt password hashes + JWT stored in an `httpOnly` cookie             |

```
PushPace/
├── backend/                 NestJS REST API (port 3001)
│   ├── database/schema.sql  Tables + demo data
│   └── src/
│       ├── auth/            register, login, logout, /me, AuthGuard
│       ├── profile/         weight / height / age / gender
│       ├── activities/      walking, running, gym (+ exercises)
│       └── entities/        TypeORM entities for the MySQL tables
├── frontend/                Next.js app (port 3000)
│   └── src/
│       ├── app/             routes: /login, /dashboard, /walking, /gym, /running
│       ├── components/      AppShell, modals, page components
│       ├── lib/             API client, types, calorie formulas
│       └── proxy.ts         redirects to /login when there is no session cookie
├── scripts/db.mjs           Runs MySQL in Docker or Podman (npm run db:up)
└── package.json             Scripts to run both apps at once
```

In the browser, the frontend only talks to its own origin. Next.js rewrites every
`/api/*` request to the NestJS server (see `frontend/next.config.ts`), so the
auth cookie stays first-party and no CORS setup is needed.

## Prerequisites

- **Node.js 20.19+** (22 LTS recommended) and npm
- **MySQL 8**. Use either:
  - Docker or Podman, which creates and seeds the database for you, or
  - a local MySQL / MariaDB server (for example from XAMPP)

## 1. Install dependencies

From the project root:

```bash
npm run install:all
```

This installs the root tooling, `backend/` and `frontend/`. To do it by hand
instead, run `npm install` in each of the three folders.

## 2. Set up the database

**Option A: Docker or Podman (easiest)**

```bash
npm run db:up
```

This finds whichever of `docker` or `podman` you have installed (no compose
plugin needed). It starts MySQL 8.4 on `localhost:3306` with user `root` and an
empty password, and waits until it's ready. The first time, it downloads the
image and runs `backend/database/schema.sql`, which creates `pushpace_db` and
loads the demo data. Later runs just restart the same container, and your data
is kept.

**Option B: An existing MySQL server (XAMPP, Homebrew, …)**

Import the schema:

```bash
mysql -u root -p < backend/database/schema.sql
```

Or in phpMyAdmin, open **Import** and pick `backend/database/schema.sql`.

> The script runs `CREATE TABLE`. To start over, drop `pushpace_db` first.

## 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local   # optional, defaults are fine locally
```

Then edit `backend/.env`:

| Variable            | Default                 | Description                                          |
| ------------------- | ----------------------- | ---------------------------------------------------- |
| `PORT`              | `3001`                  | API port                                             |
| `FRONTEND_URL`      | `http://localhost:3000` | Origins allowed by CORS (comma-separated)            |
| `DB_HOST`           | `localhost`             | MySQL host                                           |
| `DB_PORT`           | `3306`                  | MySQL port                                           |
| `DB_USER`           | `root`                  | MySQL user                                           |
| `DB_PASSWORD`       | _(empty)_               | MySQL password                                       |
| `DB_NAME`           | `pushpace_db`           | Database name                                        |
| `JWT_SECRET`        | **required**            | At least 16 characters, used to sign session tokens  |
| `SESSION_TTL_HOURS` | `24`                    | How long a login lasts                               |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`frontend/.env.local` only has `API_URL` (default `http://localhost:3001`), the
backend address that Next.js forwards `/api/*` to.

## 4. Run the project

### Development (hot reload)

From the root, start both apps together:

```bash
npm run dev
```

Or run each one in its own terminal:

```bash
cd backend  && npm run start:dev    # API on http://localhost:3001/api
cd frontend && npm run dev          # Web on http://localhost:3000
```

Open **http://localhost:3000**. Log in with a demo account or register a new one:

| Username   | Password      |
| ---------- | ------------- |
| `testuser` | `password123` |
| `demo`     | `password123` |

`testuser` already has some walks, runs and gym workouts.

### Production

```bash
npm run build      # builds backend/dist and frontend/.next
npm start          # runs both builds
```

Set `NODE_ENV=production` in `backend/.env` when serving over HTTPS, so the
auth cookie is marked `Secure`.

## Other scripts

| Command (from root) | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm test`          | Backend unit tests (Vitest)                   |
| `npm run lint`      | oxlint (backend) + ESLint (frontend)          |
| `npm run db:down`   | Stop the MySQL container (data is kept)       |
| `npm run db:reset`  | Delete all data and reload the demo data      |
| `npm run db:logs`   | Show the MySQL container logs                 |

## API reference

All routes are under `/api`. Everything except `/api/auth/*` needs the login cookie.

| Method | Route                         | Body / notes                                                        |
| ------ | ----------------------------- | ------------------------------------------------------------------- |
| POST   | `/auth/register`              | `{ username, email, password }`; logs the user in                   |
| POST   | `/auth/login`                 | `{ username, password }`                                            |
| POST   | `/auth/logout`                | Clears the cookie                                                   |
| GET    | `/auth/me`                    | `{ authenticated, user? }`                                          |
| GET    | `/profile`                    | Current user's profile                                              |
| PUT    | `/profile`                    | `{ weight, height, age, gender }`                                   |
| GET    | `/activities/:type`           | `type` = `walking`, `running` or `gym` (gym includes exercises)     |
| POST   | `/activities/walking`         | `{ date, duration, distance, steps, calories }`                     |
| POST   | `/activities/running`         | `{ date, duration, distance, pace, calories }`                      |
| POST   | `/activities/gym`             | `{ date, duration, calories, exercises: [{ name, sets, reps, weight }] }` |
| DELETE | `/activities/:type/:id`       | Only deletes the caller's own entries                               |

Dates use `YYYY-MM-DD`, durations are in minutes, distances in km, pace in min/km
and weights in kg. Invalid input gets a `400` with a list of messages.

## Troubleshooting

- **`ER_ACCESS_DENIED_ERROR` / `ECONNREFUSED` on API start**: MySQL isn't
  running, or the `DB_*` values in `backend/.env` are wrong.
- **`Invalid environment configuration … JWT_SECRET`**: create `backend/.env`
  (step 3) and set a secret of at least 16 characters.
- **`Table 'pushpace_db.users' doesn't exist`**: the schema wasn't imported
  (step 2). With the container, run `npm run db:reset` to re-create and re-seed it.
- **`npm run db:up` says the port is already in use**: another MySQL (for
  example XAMPP's) is running on 3306. Stop it, or use it instead (Option B).
- **`npm install` fails with `Cannot read properties of null (reading 'edgesOut')`**:
  this is a bug in some npm 10 releases. Use the committed lockfiles (`npm ci`),
  or run `npx npm@11 install`.
