# Chapter 4: System Design and Implementation (Foretrack)

## 4.1 Overview

Foretrack is a full-stack personal finance tracking system that enables users to manage income and expenses, define budgets, set savings goals, review analytics, and automate reporting and insights. The system is implemented using a layered architecture on the backend (Express + TypeScript) and a feature-based architecture on the frontend (React + TypeScript).

This chapter presents:

- Core use cases
- Data Flow Diagrams (DFD Level 0 and Level 1) in text form
- A class diagram / ERD description (text form)
- Screenshot requirements and the pages to capture
- Input and output specifications for key modules
- Justification of the programming language choices

> Note on diagrams: This chapter includes diagram **text descriptions** suitable for manual drawing in draw.io.

---

## 4.2 Use Cases

### 4.2.1 Actors

- **User**: A registered authenticated individual.
- **External services (system integrations)**:
  - **Google OAuth Provider** (authentication)
  - **Cloudinary** (receipt image upload)
  - **Google Gemini (AI)** (receipt scanning + AI coach responses)
  - **Email service (Resend)** (delivery of automated AI reports)
  - **MongoDB** (persistent storage)

### 4.2.2 Main Use Cases (minimum set)

1. **Register / Login**
   - User registers with email/password or signs in via Google OAuth.
   - System issues an access token and creates a default report setting.

2. **Manage Transactions**
   - Create, read, update, delete transactions.
   - Duplicate transactions.
   - Bulk insert and bulk delete transactions.
   - Import transactions via CSV (frontend workflow) which calls bulk insert.

3. **Receipt Scanning (AI Extraction)**
   - User uploads a receipt image.
   - System stores the image on Cloudinary.
   - System prompts Gemini to extract structured transaction fields.
   - System returns parsed transaction data to the client for user confirmation.

4. **Manage Budgets**
   - Create budgets per category and month.
   - Update and delete budgets.
   - View budget progress for the current selected period.

5. **Manage Goals and Contributions**
   - Create savings goals.
   - View all goals.
   - Contribute to goals manually (or assign contributions from transactions in the UI).

6. **Analytics and Dashboard**
   - View summary analytics (income/expense totals).
   - View charts (time series / breakdown).
   - View recent transactions.

7. **AI Financial Coach**
   - User asks a question with a date range preset.
   - System forwards question and user context (based on transactions) to Gemini.
   - System returns a coach response.

8. **Automated Reports (Cron)**
   - System periodically generates monthly reports for enabled users.
   - System emails AI-generated insights.
   - System updates report history and calculates the next report date.

---

## 4.3 Data Flow Diagram (DFD)

### 4.3.1 DFD Level 0 (Context Diagram) — Text Description

**System / Process:** Foretrack System

**External Entities and Data Flows:**

1. **User → Foretrack System**
   - Credentials / OAuth initiation
   - Transaction forms (create/update)
   - Receipt image upload
   - Budget and goal creation/update forms
   - Analytics date range requests
   - Coach questions
   - Report settings updates

2. **Google OAuth Provider → Foretrack System**
   - OAuth authorization code / callback details

3. **Cloudinary → Foretrack System**
   - Receipt image storage result (URL/public id)

4. **Google Gemini (AI) → Foretrack System**
   - Structured JSON for receipt scanning
   - Natural language or structured insights for AI coach

5. **Email Service (Resend) → Foretrack System**
   - Email sending responses (success/failure)

6. **MongoDB ↔ Foretrack System**
   - Read/write operations for User, Transaction, Budget, Goal, ReportSetting, Report

7. **Cron Scheduler (inside Foretrack System)**
   - Triggers scheduled report generation flows

---

### 4.3.2 DFD Level 1 — Subprocess Diagram (Text Description)

Below is a recommended Level 1 decomposition that matches the repository structure.

**Process 1: Authentication Service**

- **Inputs:** Register/Login request bodies, Google OAuth callback data
- **Processes:** Validate data → create user → hash password (on create) → issue JWT access token
- **Outputs:** Access token + user profile + reportSetting

**Process 2: Transaction Service**

- **Inputs:** Transaction CRUD requests; receipt upload (multipart image)
- **Processes:** Validate request → create/update/delete transaction records
- **Outputs:** Transaction records for the authenticated user

**Process 3: Receipt Scanning (AI Extraction)** (can be a subprocess of Transaction Service)

- **Inputs:** Receipt image from client
- **Processes:** Upload image to Cloudinary → fetch bytes → convert to base64 → prompt Gemini → parse strict JSON
- **Outputs:** Extracted transaction fields (returned to client)

**Process 4: Budget Service**

- **Inputs:** Budget create/update/delete requests; progress queries
- **Processes:** Persist budget records; compute progress for selected month
- **Outputs:** Budget list and progress summary

**Process 5: Goals Service**

- **Inputs:** Goal create/update/delete; contribute request
- **Processes:** Persist goal records; update current amount
- **Outputs:** Goal list and updated goal totals

**Process 6: Analytics Service**

- **Inputs:** Analytics requests with preset/from/to
- **Processes:** Query transactions within date range → compute summary totals and chart datasets
- **Outputs:** Summary data + chart series

**Process 7: AI Coach Service**

- **Inputs:** Coach question + date range preset/from/to
- **Processes:** Retrieve relevant transaction context → send prompt to Gemini → return response
- **Outputs:** Coach answer for display

**Process 8: Reporting & Cron Service**

- **Inputs:** User report settings (enabled frequency) and transactions
- **Processes:** Generate report content → save report status → send email via Resend → compute next report date
- **Outputs:** Updated report status/history

**Data Storage (common store):** MongoDB collections accessed by multiple subprocesses.

---

## 4.4 Class Diagram / ERD (Text Description)

The system stores its main domain entities in MongoDB via Mongoose models.

### 4.4.1 ERD (Entities and Relationships)

Use the following entities and relationships.

1. **User**

- Attributes: `name`, `email`, `password (hashed)`, `profilePicture`
- Relationships:
  - **User 1 → N Transactions**
  - **User 1 → N Budgets**
  - **User 1 → N Goals**
  - **User 1 → 1 ReportSetting**
  - **User 1 → N Reports**

2. **Transaction**

- Attributes: `userId`, `type`, `title`, `amount`, `category`, `date`, recurrence fields, `status`, `paymentMethod`, `receiptUrl`, `description`, contribution link fields
- Relationships:
  - Belongs to **User**
  - Optionally links to **Goal** for contributions

3. **Budget**

- Attributes: `userId`, `category`, `period`, `month`, `year`, `limitAmount`
- Relationships:
  - Belongs to **User**

4. **Goal**

- Attributes: `userId`, `title`, `description`, `targetAmount`, `currentAmount`, `targetDate`, `status`
- Relationships:
  - Belongs to **User**
  - Receives contribution updates from user transactions

5. **ReportSetting**

- Attributes: `userId`, `isEnabled`, `frequency`, `nextReportDate`
- Relationships:
  - Belongs to **User**
  - Drives scheduling for reports

6. **Report**

- Attributes: `userId`, report period (month/year), `status`, timestamps
- Relationships:
  - Belongs to **User**

### 4.4.2 Class Diagram (Implementation-Oriented View)

Map each major module to a conceptual class (or component) in the design.

- `AuthService`
  - Methods: register, login, googleOAuthCallback
- `TransactionService`
  - Methods: createTransaction, updateTransaction, deleteTransaction, getTransactions, duplicateTransaction, bulkInsert, bulkDelete
- `ReceiptScannerService`
  - Methods: uploadToCloudinary, extractText/base64, promptGemini, parseJson
- `BudgetService`
  - Methods: createBudget, updateBudget, deleteBudget, getBudgets, getProgress
- `GoalService`
  - Methods: createGoal, updateGoal, deleteGoal, getGoals, contributeToGoal
- `AnalyticsService`
  - Methods: summaryAnalytics, chartAnalytics, expenseBreakdown
- `CoachService`
  - Methods: askCoach(question, range)
- `ReportService`
  - Methods: generateReportForUser, updateReportHistory, calculateNextReportDate
- `CronScheduler`
  - Triggers recurring transactions job and monthly report job

---

## 4.5 Screenshots: Required Pages and What to Show

Capture screenshots from the running application. These are the **recommended page list** for Chapter 4.

1. **Authentication pages**
   - Sign in page
   - Sign up page
   - (Optional) Google OAuth callback page

2. **Home / Dashboard (Overview)** — **Main home page screenshot**
   - Dashboard header (welcome + date range)
   - Summary cards (income/expense totals)
   - Analytics chart (income vs expense / dataset chart)
   - Recent transactions table/cards
   - Budget progress card
   - Goals summary snippet
   - AI Coach widget/card

3. **Transactions page** (`/transactions`)
   - Transactions table
   - Add transaction form (or drawer/modal)
   - Edit/duplicate/delete controls (if visible)
   - Receipt scan input (AI scan receipt section)
   - Bulk import or bulk delete action (if accessible)

4. **Budgets page** (`/budgets`)
   - Create budget form
   - Budgets list
   - Progress view for month/category
   - Any alert badge (if shown in navbar)

5. **Goals page** (`/goals`)
   - Create goal form
   - Goals list
   - Contribute action UI

6. **Reports page** (`/reports`)
   - Report settings section (enable/disable)
   - Frequency selection
   - Show current status/history if available

7. **Settings page** (`/settings`)
   - Account/profile area
   - Appearance and/or billing sections (as applicable)

8. **Receipt scanning / AI flow**
   - Open the transaction add/edit flow where receipt scanning is shown
   - Show upload UI + scanning progress
   - Show extracted JSON/parsed fields ready for confirmation

> Screenshot tip: For each screenshot, include browser URL in the capture (or annotate in your thesis) to make it clear which route you captured.

---

## 4.6 Input Specifications (By Module)

### 4.6.1 Authentication

- **Register input**
  - `name` (string)
  - `email` (string)
  - `password` (string, min length enforced)

- **Login input**
  - `email` (string)
  - `password` (string)

- **Google OAuth input**
  - OAuth callback parameters handled by Passport

### 4.6.2 Transactions

- **Create transaction input**
  - `title` (string)
  - `description` (string, optional)
  - `type` (`INCOME` | `EXPENSE`)
  - `amount` (number; positive)
  - `category` (string)
  - `date` (ISO string)
  - `isRecurring` (boolean)
  - `recurringInterval` (`DAILY` | `WEEKLY` | `MONTHLY` | `YEARLY` or null)
  - `receiptUrl` (string, optional)
  - `paymentMethod` (enum)

- **Update transaction input**
  - Similar to create, but `id` is provided as route parameter.

- **Bulk insert input**
  - `transactions`: array of transaction objects (frontend batch payload)

- **Bulk delete input**
  - `transactionIds`: array of Mongo ObjectId strings (validated)

### 4.6.3 Receipt Scanning

- **Input**
  - `receipt` (multipart image file)
  - File constraints: JPEG/PNG and max size (as implemented)

### 4.6.4 Budgets

- **Create/Update budget input**
  - `category` (string)
  - `period` (MONTHLY)
  - `month` (number)
  - `year` (number)
  - `limitAmount` (number)

### 4.6.5 Goals

- **Create goal input**
  - `title` (string)
  - `description` (string optional)
  - `targetAmount` (number)
  - `targetDate` (ISO/date string)

- **Contribute input**
  - Contribution amount and goal reference (route/action)

### 4.6.6 Analytics

- **Analytics input**
  - `preset` (e.g., TODAY, LAST_7_DAYS, THIS_MONTH, ALL_TIME)
  - Optional `from` (ISO date string)
  - Optional `to` (ISO date string)

### 4.6.7 Coach

- **Coach ask input**
  - `question` (string)
  - `preset` (date preset)
  - Optional `from`, `to`

### 4.6.8 Reporting

- **Report settings input**
  - `isEnabled`
  - `frequency`
  - (Derived) next report date calculated server-side

---

## 4.7 Output Specifications (By Module)

### 4.7.1 Authentication Output

- Access token and user object
- Created report settings summary

### 4.7.2 Transactions Output

- Transaction list response
- Transaction create/update/delete results

### 4.7.3 Receipt Scanning Output

- Parsed structured transaction fields (returned to UI for confirmation)

### 4.7.4 Budgets Output

- Budgets list
- Budget progress summary for month/category

### 4.7.5 Goals Output

- Goals list
- Updated current amount after contributions

### 4.7.6 Analytics Output

- Summary statistics
- Chart datasets (time series / breakdown)

### 4.7.7 Coach Output

- Coach response text

### 4.7.8 Reporting Output

- Report history / status updates
- Email sending status (for the generated report)

---

## 4.8 Justification of Programming Language Used

### 4.8.1 TypeScript

TypeScript is chosen because it enhances reliability and maintainability for a full-stack TypeScript codebase:

- **Strong typing** for request/response DTOs and internal functions reduces runtime errors.
- **Consistency across backend and frontend** simplifies integration and reduces bugs.
- Supports IDE tooling and refactoring across large modules (services, routes, UI feature slices).

### 4.8.2 Node.js + Express

Node.js with Express is selected because:

- Large ecosystem for integrating third-party services (Cloudinary, Gemini, Resend).
- Efficient handling of JSON APIs and middleware-based architecture.
- Supports scheduled jobs using a cron library to implement automated reporting.

---

## 4.9 Summary of Chapter 4

Chapter 4 presented the system use cases, DFD Level 0 and Level 1 (in text form), and ERD/class diagram descriptions, along with input/output specifications and justification for TypeScript/Node.js.

---
