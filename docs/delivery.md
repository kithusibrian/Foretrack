# Foretrack — Delivery Package

This document describes the deliverables for Foretrack: the final running program, required support (third-party tools and runtime setup), and a short user manual (help) to run the project locally and in production.

## 1 — Program (final running copy)

What you get in this repository:

- `backend/` — TypeScript Express API. Production-ready build is emitted to `backend/dist` via `npm run build`.
- `client/` — React + Vite frontend. Production build is produced by `npm run build` in `client` (output: `client/dist`).

How to produce the final running copy (local production mode):

1. Build backend

```powershell
cd backend
npm install
npm run build
```

This will compile TypeScript to `backend/dist` and copy `package.json`.

2. Build frontend

```powershell
cd client
npm install
npm run build
```

3. Prepare environment variables (see Section 2). Create a `.env` file in `backend/` with required keys.

4. Start backend

```powershell
cd backend
npm start
```

5. Serve frontend (simple preview)

```powershell
cd client
npm run preview
```

Alternatively, copy `client/dist` to any static web host (Netlify, Vercel, S3+CloudFront, nginx).

Notes: For a one-folder deploy you can host `client/dist` as static assets and point API calls to the running `backend` host.

## 2 — Support (third-party tools and runtime)

Required runtime and third-party services:

- Node.js (v18 or later recommended) and `npm`.
- MongoDB instance accessible by `MONGO_URI` (Atlas or local). Example: `mongodb://localhost:27017/foretrack`.
- Cloudinary account for receipt image uploads (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
- Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) for sign-in.
- Google Gemini API key (`GEMINI_API_KEY`) for AI features (receipt extraction, coach).
- Resend API key (`RESEND_API_KEY`) and default sender for email sending.

Backend required environment variables (see `backend/src/config/env.config.ts`):

- `NODE_ENV` (development|production)
- `PORT` (default: 8000)
- `BASE_PATH` (default: /api)
- `MONGO_URI`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`, `RESEND_MAILER_SENDER`
- `FRONTEND_ORIGIN`, `FRONTEND_AUTH_CALLBACK_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

Frontend environment variables (see `client/.env`):

- `VITE_API_URL` — base API URL (e.g., `http://localhost:8000/api`).
- `VITE_REDUX_PERSIST_SECRET_KEY` — secret used by redux-persist (local development).

Optional / recommended tooling for production:

- PM2 or systemd to keep the Node process running.
- nginx as a reverse proxy to serve the static frontend and proxy API requests to the backend.
- Docker + Docker Compose for containerized deployment (not included here but trivial to add).
- TLS certificate (Let's Encrypt) for HTTPS.

## 3 — Help (User manual — how to run and use Foretrack)

Quick start (developer / local):

1. Clone the repository and install dependencies

```powershell
git clone <repo-url>
cd Foretrack
cd backend
npm install
cd ../client
npm install
```

2. Create environment variables

- Copy `backend/.env.example` (if present) or create `backend/.env` with the keys listed in Section 2. At minimum for local testing set:

```
MONGO_URI=mongodb://localhost:27017/foretrack
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
RESEND_MAILER_SENDER=you@domain.com
FRONTEND_ORIGIN=http://localhost:5173
```

3. Run in development (hot-reload)

Backend:
```powershell
cd backend
npm run dev
```

Frontend:
```powershell
cd client
npm run dev
```

Open the browser at the Vite URL (generally `http://localhost:5173`).

4. Using the app (basic user flows)

- Register or sign in (email/password or Google OAuth).
- Add a transaction: open Transactions → Add Transaction; fill `title`, `amount`, `category`, and submit.
- Upload a receipt image in Add Transaction flow to auto-extract fields (requires `GEMINI_API_KEY` and `CLOUDINARY` configured).
- Create budgets: open Budgets → Create Budget (category, month, year, limit).
- Create goals: open Goals → Create Goal (title, target amount, target date).
- View Dashboard: main page shows income/expense summary, charts, budgets, and goals.
- Enable automated reports in Reports → Settings to receive periodic emailed reports.

5. Production notes

- Use `npm run build` in both `backend` and `client` and host the built assets as described in Section 1.
- Use reverse proxy (nginx) and TLS for secure production operation.
- Configure monitoring and backups for MongoDB (Atlas provides automated backups).

6. Troubleshooting

- If API calls fail, confirm `VITE_API_URL` matches backend `BASE_PATH` and `PORT` and that CORS/FRONTEND_ORIGIN is configured properly.
- Check `backend/logs` or console output for stack traces. Use `pm2 logs` if running under PM2.
- If receipt scanning fails, confirm `GEMINI_API_KEY` and Cloudinary credentials are valid and reachable.

## 4 — Deliverable checklist

- [x] `backend` production build instructions
- [x] `client` production build instructions
- [x] Environment variables and support services listed
- [x] Quick-start and user manual steps

---
If you want, I can also:

- Add a simple `Dockerfile` and `docker-compose.yml` for quick local production runs.
- Create a `backend/.env.example` file populated with the keys above.
- Build an archive (zip) with built `dist` and `client/dist` that you can download.
