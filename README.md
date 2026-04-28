# Foretrack

Foretrack is a full-stack personal finance tracking platform that helps users manage income and expenses, set budgets, track financial goals, and receive AI-powered insights and automated reports.

## Product Overview

Foretrack helps users:

- **Register and authenticate** securely with JWT or Google OAuth
- **Record income and expenses** with structured categories, payment methods, and receipt attachments
- **Track recurring transactions** with automatic next-occurrence calculations
- **Set monthly budgets** by category with progress tracking and spending alerts
- **Create savings goals** with contribution tracking and completion status
- **View analytics dashboards** with income vs. expense trends, category breakdowns, and period-over-period comparisons
- **Consult an AI Financial Coach** powered by Google Gemini for personalized advice based on real transaction data
- **Receive automated financial reports** via email with AI-generated insights
- **Upload receipt images** and extract transaction details automatically with Google Gemini
- **Search, paginate, duplicate, and bulk-manage** transactions efficiently

## Tech Stack

### Backend

- Node.js 18+
- TypeScript
- Express 5
- MongoDB + Mongoose
- Passport + passport-jwt + passport-google-oauth20
- Zod (validation)
- Cloudinary + Multer (image uploads)
- Google GenAI SDK (Gemini)
- Resend (transactional email)
- node-cron (scheduled jobs)
- date-fns
- bcrypt, jsonwebtoken, helmet, cors

### Frontend

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- shadcn/ui + Radix UI primitives
- Redux Toolkit + React-Redux + redux-persist
- React Router DOM 7
- Recharts (charts)
- React Hook Form + Zod resolvers
- date-fns, lucide-react, sonner (toast notifications)

## Repository Layout

```text
Foretrack/
  backend/
    src/
      config/         # environment, database, passport, cloudinary, Google AI
      controllers/    # request handlers
      cron/           # scheduled jobs (recurring transactions, monthly reports)
      mailers/        # email templates and sending logic
      middlewares/    # async wrapper, error handling, auth
      models/         # Mongoose schemas
      routes/         # API route modules
      services/       # business logic
      utils/          # helpers (jwt, prompts, currency, dates)
      validators/     # Zod request validation schemas
      @types/         # shared TypeScript types
  client/
    src/
      app/            # Redux store and API client setup
      components/     # reusable UI components and feature components
      context/        # theme provider
      features/       # Redux slices (auth, budget, goal, report, transaction, user, analytics)
      hooks/          # custom React hooks
      layouts/        # app and base layouts
      lib/            # utility functions
      pages/          # route-level page components
      routes/         # route definitions and guards
```

## System Architecture

Foretrack follows a layered backend structure:

1. **Route layer** maps URL paths to controllers.
2. **Controller layer** validates input and manages HTTP responses.
3. **Service layer** contains business logic and DB operations.
4. **Model layer** defines persistent data schemas in MongoDB.
5. **Error middleware** normalizes all thrown errors into structured API responses.

The frontend uses a feature-based Redux architecture with API clients, route guards, and reusable UI components.

## Core Domain Models

### User

Key fields: `name`, `email`, `password`, `profilePicture`.

- Password is hashed automatically in a pre-save hook.
- Password is omitted from API-safe user objects.
- Supports both local registration and Google OAuth.

### Transaction

Primary fields:

- `userId`, `type`, `title`, `amount`, `category`, `date`
- `isRecurring`, `recurringInterval`, `nextRecurringDate`, `lastProcessed`
- `status`, `paymentMethod`, `receiptUrl`, `description`
- `isContribution`, `goalId` (links to savings goals)

Enums:

- `type`: `INCOME`, `EXPENSE`
- `recurringInterval`: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`
- `paymentMethod`: `CARD`, `BANK_TRANSFER`, `MOBILE_PAYMENT`, `AUTO_DEBIT`, `CASH`, `OTHER`

Currency handling:

- Amount is stored internally in cents and exposed with getter conversion to the display currency.

### Budget

- `userId`, `category`, `period` (`MONTHLY`), `month`, `year`, `limitAmount`
- Unique per user + category + month + year
- Amount stored in cents with getter/setter conversion

### Goal

- `userId`, `title`, `description`, `targetAmount`, `currentAmount`, `targetDate`, `status`
- Status enum: `ACTIVE`, `COMPLETED`, `CANCELLED`
- Supports manual contributions and transaction-linked contributions

### ReportSetting

- Tracks per-user reporting preferences (enabled/disabled, frequency, next report date)
- Created automatically during user registration

### Report

- Tracks report send history and status per period
- Status enum: `SENT`, `PENDING`, `FAILED`, `NO_ACTIVITY`

## Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=8000
BASE_PATH=/api
MONGO_URI=mongodb://127.0.0.1:27017/foretrack

JWT_SECRET=replace_with_secure_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace_with_secure_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev

FRONTEND_ORIGIN=http://localhost:5173
FRONTEND_AUTH_CALLBACK_URL=http://localhost:5173/oauth/callback
```

Notes:

- `MONGO_URI` and `GEMINI_API_KEY` are required for core runtime features.
- `FRONTEND_ORIGIN` should include the protocol for CORS correctness.
- `RESEND_API_KEY` is required for automated report emails.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are required for OAuth login.

## Local Development

### Prerequisites

- Node.js 18+
- npm
- MongoDB instance (local or cloud)
- Cloudinary account
- Google AI API key
- Resend account (for emails)
- Google OAuth credentials (for OAuth login)

### Run Backend

```bash
cd backend
npm install
npm run dev
```

Server default:

```text
http://localhost:8000
```

Default API base path:

```text
http://localhost:8000/api
```

### Run Frontend

```bash
cd client
npm install
npm run dev
```

Client default:

```text
http://localhost:5173
```

### Production Build

Backend:

```bash
cd backend
npm run build
npm run start
```

Frontend:

```bash
cd client
npm run build
```

## Available Scripts

### Backend

- `npm run dev`: starts the server with hot reload via `ts-node-dev`
- `npm run build`: compiles TypeScript to `dist/` and copies `package.json`
- `npm run start`: starts the compiled server from `dist/index.js`

### Frontend

- `npm run dev`: starts the Vite dev server with host binding
- `npm run build`: type-checks and builds for production
- `npm run lint`: runs ESLint
- `npm run preview`: previews the production build

## Authentication and Authorization

- Auth strategies: JWT Bearer token via Passport and Google OAuth 2.0
- Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

- Access token is issued on successful login or OAuth callback.
- JWT audience is configured for `user`.

## API Reference

All endpoints below are relative to `BASE_PATH` (default `/api`).

### Health/Root

- `GET /`

Current behavior:

- This endpoint intentionally throws a test `BadRequestException` in the current code.

### Auth Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google` — initiates Google OAuth
- `GET /auth/google/callback` — handles Google OAuth callback

Register request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "1234"
}
```

Login request body:

```json
{
  "email": "jane@example.com",
  "password": "1234"
}
```

Login response (shape):

```json
{
  "message": "User logged in successfully",
  "user": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "accessToken": "...",
  "expiresAt": 1774359038000,
  "reportSetting": {
    "_id": "...",
    "frequency": "MONTHLY",
    "isEnabled": true
  }
}
```

### User Endpoints

- `GET /user/current-user` (protected)
- `PUT /user/update-profile` (protected)
- `PUT /user/update-password` (protected)

### Transaction Endpoints

- `POST /transaction/create` (protected)
- `GET /transaction/all` (protected)
- `GET /transaction/:id` (protected)
- `PUT /transaction/duplicate/:id` (protected)
- `PUT /transaction/update/:id` (protected)
- `DELETE /transaction/delete/:id` (protected)
- `DELETE /transaction/bulk-delete` (protected)
- `POST /transaction/bulk-transaction` (protected)
- `POST /transaction/scan-receipt` (protected, multipart/form-data)

Create transaction body:

```json
{
  "title": "Uber ride",
  "description": "Airport pickup",
  "type": "EXPENSE",
  "amount": 25.5,
  "category": "transport",
  "date": "2026-03-24T10:00:00.000Z",
  "isRecurring": false,
  "recurringInterval": null,
  "receiptUrl": "https://example.com/receipt.jpg",
  "paymentMethod": "CARD"
}
```

List transactions query parameters:

- `keyword`: full-text style match against title/category
- `type`: `INCOME` or `EXPENSE`
- `recurringStatus`: `RECURRING` or `NON_RECURRING`
- `pageSize`: defaults to `20`
- `pageNumber`: defaults to `1`

Bulk delete body:

```json
{
  "transactionIds": ["<mongoObjectId>", "<mongoObjectId>"]
}
```

Bulk insert body:

```json
{
  "transactions": [
    {
      "title": "Salary",
      "type": "INCOME",
      "amount": 1200,
      "category": "income",
      "date": "2026-03-24T10:00:00.000Z",
      "isRecurring": false,
      "paymentMethod": "BANK_TRANSFER"
    }
  ]
}
```

### Receipt Scanning

Endpoint:

- `POST /transaction/scan-receipt`

Request requirements:

- Content type: `multipart/form-data`
- File field: `receipt`
- Supported MIME types: `image/jpeg`, `image/jpg`, `image/png`
- Max upload size: 2 MB

Processing flow:

1. Receipt image is uploaded to Cloudinary.
2. Image bytes are fetched and converted to base64.
3. Gemini is prompted to return strict JSON transaction fields.
4. Parsed output is returned to caller for optional user confirmation.

### Budget Endpoints

- `POST /budget/create` (protected)
- `GET /budget/all` (protected)
- `GET /budget/progress` (protected)
- `PUT /budget/update/:id` (protected)
- `DELETE /budget/delete/:id` (protected)

### Goal Endpoints

- `POST /goal/create` (protected)
- `GET /goal/all` (protected)
- `GET /goal/:id` (protected)
- `PUT /goal/update/:id` (protected)
- `DELETE /goal/delete/:id` (protected)
- `POST /goal/:id/contribute` (protected)

### Analytics Endpoints

- `GET /analytics/summary` (protected)
- `GET /analytics/chart` (protected)
- `GET /analytics/expense-breakdown` (protected)

Query parameters for analytics:

- `preset`: `TODAY`, `YESTERDAY`, `LAST_7_DAYS`, `LAST_30_DAYS`, `THIS_MONTH`, `LAST_MONTH`, `THIS_YEAR`, `LAST_YEAR`, `ALL_TIME`
- `from`: ISO date string (optional, for custom ranges)
- `to`: ISO date string (optional, for custom ranges)

### Report Endpoints

- `GET /report/all` (protected)
- `PUT /report/settings` (protected)

### Coach Endpoints

- `POST /coach/ask` (protected)

Request body:

```json
{
  "question": "How can I reduce my expenses?",
  "preset": "THIS_MONTH",
  "from": "2026-01-01",
  "to": "2026-01-31"
}
```

## Validation Rules

Important validations currently enforced:

- Register/login email must be a valid email format.
- Password minimum length is 4.
- Transaction amount must be positive.
- Bulk insert allows 1 to 300 transactions per request.
- Bulk delete validates Mongo ObjectId string length (24 chars).

## Error Handling Contract

Validation error format:

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "amount", "message": "Amount must be postive" }],
  "errorCode": "VALIDATION_ERROR"
}
```

App/domain error format:

```json
{
  "message": "Transaction not found",
  "errorCode": "RESOURCE_NOT_FOUND"
}
```

Unhandled server error format:

```json
{
  "message": "Internal Server Error",
  "error": "..."
}
```

## Cron Jobs

Scheduled jobs run automatically in development mode:

1. **Recurring Transactions** — runs daily at 12:05 AM UTC
   - Processes due recurring transactions and generates the next occurrence.

2. **Monthly Reports** — runs at 2:30 AM UTC on the 1st of every month
   - Generates financial reports for the previous month.
   - Sends AI-generated insight emails to users who have enabled reports.
   - Updates report settings with the next scheduled report date.

## Quick API Usage Example

Register:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"1234"}'
```

Login:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"1234"}'
```

Get current user (replace token):

```bash
curl http://localhost:8000/api/user/current-user \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Known Behaviors and Limitations

- Root endpoint (`GET /`) currently throws a test error intentionally.
- Transaction list response key uses `transations` spelling as implemented.
- Refresh token configuration exists in env, but no refresh-token route is currently exposed.
- AI coach responses are streaming text from Gemini and may occasionally vary in structure.

## Security Notes

- Store strong secrets for JWT in all environments.
- Do not commit `.env` files.
- Restrict `FRONTEND_ORIGIN` to trusted client URLs.
- Validate and sanitize all uploaded files at the edge and app layers.
- Keep Google OAuth credentials confidential.

## Recommended Next Steps

- Add refresh-token route and token rotation for improved session security.
- Add integration tests for auth, transaction filters, bulk endpoints, and report generation.
- Add OpenAPI/Swagger documentation for API consumers.
- Implement e2e tests for critical frontend flows.
- Add multi-currency support beyond the current display format.
- Introduce data export (CSV/PDF) for transactions and reports.
