# Setup Guide

Step-by-step local setup for HealthOps. Follow in order. Commands are taken from the repository (`package.json` scripts and Prisma config).

This guide assumes you have already cloned the repository and opened a terminal at the **repository root**.

---

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Node.js + npm** | No `engines` field in package files. Local use with Node 24.x / npm 11.x is known to work with this stack. |
| **PostgreSQL** | Required. Prisma datasource provider is `postgresql`. |
| **Git** | To clone the repo (if not already). |

Optional but useful: curl or Postman for API checks; a browser for the UI.

---

## 1. Clone / open the project

If you do not already have the code:

```bash
git clone <your-remote-url> healthcare-automation-app
cd healthcare-automation-app
```

Confirm you see `backend/`, `frontend/`, `docs/`, and `project-documentation/`.

---

## 2. Install backend dependencies

```bash
cd backend
npm install
```

Stay in `backend/` for sections 3–7.

---

## 3. Environment configuration

There is **no** committed `.env.example`. Create `backend/.env` yourself.

### Required

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string. `backend/src/config/prisma.ts` throws if missing. |

Example shape (replace user, password, host, port, database name):

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/healthops
```

### Optional

| Variable | Default / behavior |
|----------|-------------------|
| `JWT_SECRET` | Falls back to `local-development-secret` if unset |
| `ADMIN_EMAIL` | Used by admin script; default `admin@healthcare.local` |
| `ADMIN_PASSWORD` | Used by admin script; default `Admin@12345` |

Example optional block:

```env
JWT_SECRET=local-development-secret
ADMIN_EMAIL=admin@healthcare.local
ADMIN_PASSWORD=Admin@12345
```

**Never commit real secrets.** Do not paste production passwords into documentation or chat logs.

---

## 4. Database setup

1. Ensure PostgreSQL is running.
2. Create an empty database whose name matches `DATABASE_URL`.
3. From `backend/`:

```bash
npx prisma migrate deploy
```

4. Generate the Prisma client (run if imports fail after install/migrate):

```bash
npx prisma generate
```

Prisma config file: `backend/prisma.config.ts` (reads `DATABASE_URL`).

---

## 5. Backend startup

From `backend/`:

```bash
npm run dev
```

This runs `tsx watch src/server.ts`.

Expected console output:

```text
Healthcare API running on http://localhost:4000
```

Port **4000** is hardcoded in `backend/src/server.ts`.

### Production-style start (optional)

```bash
npm run build
npm start
```

(`build` → `tsc`; `start` → `node dist/server.js`)

---

## 6. Install frontend dependencies

Open a **second** terminal:

```bash
cd frontend
npm install
```

---

## 7. Frontend startup

From `frontend/`:

```bash
npm run dev
```

This runs Vite. The default Vite URL is usually:

```text
http://localhost:5173
```

The frontend API client targets `http://localhost:4000/api` (hardcoded in `frontend/src/services/api.ts`). Keep the backend running.

---

## 8. Verify setup

### Database + backend

```bash
curl http://localhost:4000/api/health
```

Healthy response:

```json
{
  "status": "UP",
  "database": "CONNECTED",
  "message": "Healthcare API is running"
}
```

If `status` is `DOWN` or `database` is `DISCONNECTED`, fix PostgreSQL / `DATABASE_URL` before continuing.

### Frontend

1. Open the Vite URL in a browser (typically `http://localhost:5173`).
2. You should see the login page (root `/` redirects to `/login`).

### Login

1. Create an admin (recommended for first staff login) — next section — **or** register a PATIENT/DOCTOR/PHARMACIST via `/register`.
2. Sign in on `/login`.
3. You should land on `/dashboard` with role-appropriate navigation.

---

## 9. First login / development admin

From `backend/` (database must be migrated and `.env` loaded):

```bash
npx tsx src/scripts/create-admin.ts
```

Defaults (unless overridden by `ADMIN_EMAIL` / `ADMIN_PASSWORD`):

| Field | Default |
|-------|---------|
| Email | `admin@healthcare.local` |
| Password | `Admin@12345` |

The script creates the admin or updates an existing user with that email to ADMIN / ACTIVE with the chosen password.

**Other roles are not seeded.** Create them via:

- UI `/register` or `POST /api/auth/register` for PATIENT, DOCTOR, PHARMACIST
- `POST /api/users` as ADMIN for ADMIN/DOCTOR/PHARMACIST/SUPPORT/VIEWER

---

## 10. Troubleshooting

### Database connection problems

- Confirm PostgreSQL is running and accepting connections.
- Confirm database exists and `DATABASE_URL` credentials are correct.
- Restart backend after changing `.env`.
- Check `GET /api/health` for `DISCONNECTED`.

### Environment variable problems

- `DATABASE_URL is not defined` → `.env` missing or not in `backend/` when process starts.
- Unexpected auth behavior → set an explicit `JWT_SECRET` for your machine.

### Prisma / migration problems

- Run commands from `backend/` so `prisma.config.ts` and schema paths resolve.
- `migrate deploy` applies existing migrations; it does not invent schema.
- After migrate, run `npx prisma generate` if TypeScript cannot import the client.
- If the database was created manually with conflicting objects, reset carefully in a **dev** database only (destructive ops are outside this guide’s safe defaults).

### Backend startup problems

- Port 4000 already in use → stop the other process or free the port (app does not read a PORT env var).
- Dependency errors → delete `node_modules` and re-run `npm install` in `backend/`.
- Confirm you are using `npm run dev` for TypeScript source (`src/server.ts`).

### Frontend / backend connectivity

- Frontend expects API at `http://localhost:4000/api`.
- CORS is enabled on the backend for local SPA use.
- If the UI loads but all calls fail, confirm backend console shows the server listening and health is UP.
- Browser mixed-content is not an issue on local HTTP.

### HTTP 401

- Missing or expired JWT.
- Login again; with remember-me off, session ends when the tab/session storage clears or token expires (1h).
- Wrong `JWT_SECRET` between token issue and verify (restart both after changing secret; old tokens become invalid).

### HTTP 403

- Authenticated but role not allowed for that route.
- Patient accessing another patient’s id (ownership check).
- Use an account whose role matches the API (see [AUTH_RBAC.md](./AUTH_RBAC.md)).

### HTTP 404

- Wrong URL or id.
- Confirm path prefix `/api/...` and that the resource exists.

### HTTP 409 / business conflicts

- Often domain conflicts (overlaps, duplicate open requests, concurrent stock updates, duplicate email/SKU).
- Read the API `message` field; adjust data or complete the conflicting workflow.

### Password reset not emailing

- **KNOWN LIMITATION:** tokens are logged on the server and may appear in the forgot-password API response for development. Check backend console output.

---

## Related documentation

- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) — doc index
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system shape
- [AUTH_RBAC.md](./AUTH_RBAC.md) — roles and auth
- [docs/API_TESTING_GUIDE.md](../docs/API_TESTING_GUIDE.md) — API-only testing path
- [docs/API_GUIDE_EntryPoint.md](../docs/API_GUIDE_EntryPoint.md) — API docs entry
