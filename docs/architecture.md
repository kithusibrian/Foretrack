# System Architecture — Foretrack

This diagram shows the high-level architecture and integration points for Foretrack.

```mermaid
graph LR
  subgraph Client
    A[Browser / React App]
  end

  subgraph API[API Server — Node.js / Express]
    direction TB
    API_GW[API Gateway / Routes]
    AuthSvc[Auth Service]
    TxSvc[Transaction Service]
    ReceiptSvc[Receipt Scanner Service]
    BudgetSvc[Budget Service]
    GoalSvc[Goal Service]
    AnalyticsSvc[Analytics Service]
    ReportSvc[Report Service]
    Cron[Scheduler / Cron Jobs]
  end

  subgraph DB[Database]
    Mongo[(MongoDB)]
  end

  subgraph External[External Services]
    OAuth[Google OAuth]
    Cloudinary[Cloudinary (images)]
    Gemini[Google Gemini (AI)]
    Resend[Resend (Email)]
  end

  A -->|HTTPS JSON/API| API_GW
  API_GW --> AuthSvc
  API_GW --> TxSvc
  API_GW --> BudgetSvc
  API_GW --> GoalSvc
  API_GW --> AnalyticsSvc
  API_GW --> ReportSvc

  AuthSvc -->|reads/writes| Mongo
  TxSvc -->|reads/writes| Mongo
  BudgetSvc -->|reads/writes| Mongo
  GoalSvc -->|reads/writes| Mongo
  AnalyticsSvc -->|reads| Mongo
  ReportSvc -->|reads/writes| Mongo

  TxSvc -->|upload receipt| Cloudinary
  ReceiptSvc -->|upload/fetch| Cloudinary
  ReceiptSvc -->|prompt| Gemini
  ReportSvc -->|send email| Resend

  AuthSvc -->|oauth flow| OAuth

  Cron -->|trigger| ReportSvc
  Cron -->|trigger recurring jobs| TxSvc

  API_GW -.->|websocket / push| A

  Mongo ---|backups/logs| ExternalStorage[(Backup/Monitoring)]

  style API fill:#f8f9fa,stroke:#333,stroke-width:1px
  style External fill:#fff7e6
  style DB fill:#e6f7ff

``` 

Short component descriptions:

- **Browser / React App**: Single-page app that authenticates users and calls the API for all actions (transactions, budgets, goals, analytics, reports).
- **API Server**: Express app in TypeScript exposing REST endpoints and handling orchestration between services and external providers.
- **Auth Service**: Handles JWT/session issuance, password hashing, and Google OAuth callbacks.
- **Transaction Service**: Manages CRUD for transactions, recurring processing, and bulk imports.
- **Receipt Scanner Service**: Uploads images to Cloudinary and sends prompts to Google Gemini to extract structured data.
- **Budget & Goal Services**: Domain services for budgets and goals, including progress computation.
- **Analytics Service**: Aggregates transactions to produce dashboard datasets and charts.
- **Report Service**: Generates periodic reports (uses AI for insights) and sends emails via Resend; stores `Report` records in MongoDB.
- **Cron Scheduler**: Periodic jobs for generating/sending reports and processing recurring transactions.
- **MongoDB**: Primary persistent store for users, transactions, budgets, goals, report settings and history.
- **External Services**: Google OAuth, Cloudinary (media), Google Gemini (AI), Resend (email).

How to use this diagram:

- Render the Mermaid block in Markdown-capable viewers (VS Code preview, GitHub, or Mermaid live editor). Replace or expand services as needed for deployment details (Docker, Kubernetes, load balancers).
