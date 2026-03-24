# Foretrack

Foretrack is a personal finance tracking platform focused on reliable transaction management, recurring expense tracking, and AI-assisted receipt data extraction.

At the moment, the backend API is fully scaffolded and functional for authentication, user profile retrieval, transaction CRUD, bulk transaction operations, and receipt scanning. The frontend application directory is present but not implemented yet.

## Product Overview

Foretrack helps users:

- Register and authenticate securely with JWT
- Record income and expenses with structured categories
- Track recurring transactions with calculated next occurrence dates
- Search and paginate transactions efficiently
- Duplicate and bulk-insert transactions for faster data entry
- Upload receipt images and extract transaction details with Google Gemini

## Current Scope

- Backend API: implemented in TypeScript with Express
- Database: MongoDB with Mongoose models
- Authentication: Passport JWT (Bearer token)
- Validation: Zod schemas on request payloads
- Uploads: Cloudinary storage through Multer middleware
- AI integration: Gemini model for receipt parsing
- Client app: directory exists but is currently empty

## Tech Stack

- Node.js
- TypeScript
- Express
- MongoDB + Mongoose
- Passport + passport-jwt
- Zod
- Cloudinary + Multer
- Google GenAI SDK
- date-fns

## Repository Layout

```text
Foretrack/
  backend/
    src/
      config/         # app, env, database, auth, cloud, ai configs
      controllers/    # request handlers
      middlewares/    # async wrapper + centralized error handling
      models/         # mongoose schemas and enums
      routes/         # API route modules
      services/       # business logic
      utils/          # helper utilities (jwt, prompt, currency, etc.)
      validators/     # zod request validation schemas
      crons/          # scheduled jobs (currently empty)
  client/             # frontend app (currently empty)
```

## System Architecture

Foretrack follows a layered backend structure:

1. Route layer maps URL paths to controllers.
2. Controller layer validates input and manages HTTP responses.
3. Service layer contains business logic and DB operations.
4. Model layer defines persistent data schemas in MongoDB.
5. Error middleware normalizes all thrown errors into API responses.

This architecture keeps endpoint handlers small and moves logic into reusable service functions.

## Core Domain Models

### User

Key fields: `name`, `email`, `password`, `profilePicture`.

Security behavior:

- Password is hashed automatically in a pre-save hook.
- Password is omitted from API-safe user objects via `omitPassword()`.

### Transaction

Primary fields:

- `userId`, `type`, `title`, `amount`, `category`, `date`
- `isRecurring`, `recurringInterval`, `nextRecurringDate`, `lastProcessed`
- `status`, `paymentMethod`, `receiptUrl`, `description`

Enums:

- `type`: `INCOME`, `EXPENSE`
- `recurringInterval`: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`
- `paymentMethod`: `CARD`, `BANK_TRANSFER`, `MOBILE_PAYMENT`, `AUTO_DEBIT`, `CASH`, `OTHER`

Currency handling:

- Amount is stored internally in cents and exposed with getter conversion.

### ReportSetting

- Tracks per-user reporting preferences.
- Current frequency enum: `MONTHLY`.
- Created automatically during user registration.

### Report

- Tracks report send history and status per period.
- Status enum: `SENT`, `PENDING`, `FAILED`, `NO_ACTIVITY`.

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

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

FRONTEND_ORIGIN=http://localhost:3000
```

Notes:

- `MONGO_URI` and `GEMINI_API_KEY` are required for core runtime features.
- `FRONTEND_ORIGIN` should include protocol for CORS correctness.
- Refresh token env keys exist, though refresh-token flow is not yet exposed via routes.

## Local Development

### Prerequisites

- Node.js 18+
- npm
- MongoDB instance (local or cloud)
- Cloudinary account
- Google AI API key

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

### Production Build

```bash
cd backend
npm run build
npm run start
```

## Available Scripts

- `npm run dev`: starts server with hot reload via `ts-node-dev`
- `npm run build`: compiles TypeScript to `dist/` and copies package manifest
- `npm run start`: starts compiled server from `dist/index.js`

## Authentication and Authorization

- Auth strategy: JWT Bearer token via Passport.
- Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

- Access token is issued on successful login.
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

Update transaction body:

- Uses a partial version of the create schema.
- You can send only fields you want to change.

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

Expected response shape:

```json
{
  "title": "Receipt",
  "amount": 58.43,
  "date": "2026-03-24",
  "description": "Groceries",
  "category": "groceries",
  "paymentMethod": "CARD",
  "type": "EXPENSE",
  "receiptUrl": "https://..."
}
```

## Validation Rules

Important validations currently enforced:

- Register/login email must be valid email format.
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

- Root endpoint currently throws a test error intentionally.
- Transaction list response currently returns key `transations` (spelling as implemented).
- Refresh token configuration exists in env, but no refresh route is currently exposed.
- Cron directory exists but does not yet include scheduled jobs.
- Frontend folder exists and is currently empty.

## Security Notes

- Store strong secrets for JWT in all environments.
- Do not commit `.env` files.
- Restrict `FRONTEND_ORIGIN` to trusted client URLs.
- Validate and sanitize all uploaded files at the edge and app layers.

## Recommended Next Steps

- Add refresh-token route and token rotation.
- Add integration tests for auth, transaction filters, and bulk endpoints.
- Add OpenAPI/Swagger documentation for API consumers.
- Implement recurring transaction processor in `src/crons`.
- Build and document the frontend client application.
