# Netflix Subscription Manager - Technical Plan & Implementation Summary

## Project Overview
**Netflix Subscription Manager** is a full-stack web application built with Node.js + Express (backend), React (frontend), and PostgreSQL (database). The application manages Netflix-like subscription plans, user accounts, and subscription lifecycle.

**Status:** Fully functional with core features implemented  
**Start Date:** Migrated from MySQL to PostgreSQL  
**Current Version:** 1.0.0

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     NETFLIX SUBSCRIPTION MANAGER            │
└─────────────────────────────────────────────────────────────┘

Frontend (React)                Backend (Node.js/Express)      Database
┌──────────────────┐            ┌─────────────────────┐      (PostgreSQL)
│   React App      │◄──────────►│   Express Server    │◄────►┌────────┐
│  (Port 3000)     │  HTTP REST │   (Port 4000)       │      │ Netflix│
│                  │            │                     │      │ Clone  │
└──────────────────┘            └─────────────────────┘      │ DB     │
                                        ▲                     └────────┘
                                        │
                                    PostgreSQL
                                   (Port 5432)
```

---

## Technology Stack

### Backend
- **Runtime:** Node.js 14+
- **Framework:** Express.js 4.18.2
- **Database Driver:** pg 8.10.0 (PostgreSQL)
- **Authentication:** bcryptjs (password hashing)
- **Email Service:** nodemailer 6.9.7
- **Dev Tools:** nodemon 2.0.22
- **CORS:** Enabled for frontend communication
- **Environment:** dotenv 16.0.0

### Frontend
- **Framework:** React 18.2.0
- **Build Tool:** React Scripts 5.0.1
- **Styling:** CSS (local styles.css)
- **State Management:** React Hooks (useState, useEffect)
- **Storage:** Browser localStorage

### Database
- **System:** PostgreSQL 10+
- **Connection Pool:** pg Pool (5+ concurrent connections)
- **Port:** 5432
- **Default User:** postgres

---

## Database Schema & Tables

### 1. **Users Table**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Unique user identifier
- `name`: User's display name
- `email`: Unique email address
- `password_hash`: bcrypt-hashed password (never stored in plain text)
- `password_reset_token`: Temporary token for password recovery (valid 1 hour)
- `password_reset_expires`: Expiration timestamp for reset token
- `created_at`: Account creation timestamp

**Key Features:** Email uniqueness constraint, password security with bcrypt, password reset functionality

---

### 2. **Plans Table**
```sql
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  price_cents INT NOT NULL,
  interval VARCHAR(20) NOT NULL DEFAULT 'monthly',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Seeded Plans:**
- **Basic:** $199.00/month - Watch on 1 screen in Standard Definition
- **Standard:** $499.00/month - Watch on 2 screens in High Definition
- **Premium:** $649.00/month - Watch on 4 screens in Ultra HD

**Columns:**
- `id`: Plan identifier
- `name`: Plan name
- `price_cents`: Price in cents (e.g., 19900 = $199.00)
- `interval`: Billing cycle (default: "monthly")
- `description`: Plan features/description
- `created_at`: Plan creation date

---

### 3. **Subscriptions Table**
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  status subscription_status DEFAULT 'active',
  started_at DATE,
  ends_at DATE NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
);
```

**Status Enum:** `active`, `cancelled`, `expired`, `paused`

**Columns:**
- `id`: Subscription identifier
- `user_id`: Foreign key to users table (cascade delete)
- `plan_id`: Foreign key to plans table (restrict delete)
- `status`: Current subscription state
- `started_at`: Subscription start date
- `ends_at`: Subscription end date (nullable)
- `auto_renew`: Automatic renewal flag (default: true)
- `created_at`: Subscription creation timestamp
- `updated_at`: Last update timestamp

---

## Backend API Endpoints

### Base URL: `http://localhost:4000/api`

### **Users Endpoints** (`/api/users`)

#### 1. **POST /users/register** - Create New Account
```
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (201 Created):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-04-10T12:00:00.000Z"
}
```

**Validation:**
- Email required and must be unique
- Name required
- Password required, minimum 6 characters
- Returns 409 if email already exists

---

#### 2. **POST /users/login** - Authenticate User
```
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-04-10T12:00:00.000Z"
}
```

**Validation:**
- All fields required
- Checks name + email combination
- Verifies bcrypt password hash
- Returns 401 if credentials invalid
- Returns user without password_hash

---

#### 3. **POST /users/forgot-password** - Request Password Reset
```
Request:
{
  "email": "john@example.com"
}

Response (200 OK):
{
  "message": "If an account exists with this email, a password reset link will be sent shortly."
}
```

**Features:**
- Always returns 200 (security: doesn't reveal if email exists)
- Generates 32-byte random hex token
- Token valid for 1 hour
- Sends email with reset link via nodemailer
- Email includes reset token in URL parameter

---

#### 4. **POST /users/reset-password** - Reset Password with Token
```
Request:
{
  "token": "abc123token...",
  "newPassword": "newSecurePassword123"
}

Response (200 OK):
{
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Validation:**
- Token required and must be valid + not expired
- New password required, minimum 6 characters
- Returns 400 if token invalid/expired
- Clears reset token after successful reset
- Sends confirmation email to user

---

#### 5. **GET /users** - List All Users
```
Response (200 OK):
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-04-10T12:00:00.000Z"
  },
  {...}
]
```

**Note:** Returns all users ordered by creation date (DESC)

---

#### 6. **GET /users/:id** - Get User by ID
```
Response (200 OK):
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-04-10T12:00:00.000Z"
}

Response (404 Not Found):
{
  "error": "not found"
}
```

---

### **Plans Endpoints** (`/api/plans`)

#### 1. **GET /plans** - List All Plans
```
Response (200 OK):
[
  {
    "id": 1,
    "name": "Basic",
    "price_cents": 19900,
    "interval": "monthly",
    "description": "Watch on 1 screen in Standard Definition",
    "created_at": "2024-04-10T12:00:00.000Z"
  },
  {...}
]
```

**Note:** Sorted by price (ascending)

---

#### 2. **GET /plans/:id** - Get Plan Details
```
Response (200 OK):
{
  "id": 1,
  "name": "Basic",
  "price_cents": 19900,
  "interval": "monthly",
  "description": "Watch on 1 screen in Standard Definition",
  "created_at": "2024-04-10T12:00:00.000Z"
}
```

---

#### 3. **POST /plans** - Create New Plan (Admin)
```
Request:
{
  "name": "Family",
  "price_cents": 79900,
  "interval": "monthly",
  "description": "Watch on 6 screens in Ultra HD"
}

Response (201 Created):
{
  "id": 4,
  "name": "Family",
  "price_cents": 79900,
  "interval": "monthly",
  "description": "Watch on 6 screens in Ultra HD",
  "created_at": "2024-04-10T12:00:00.000Z"
}
```

---

#### 4. **PUT /plans/:id** - Update Plan
```
Request:
{
  "name": "Basic Plus",
  "price_cents": 21900,
  "interval": "monthly",
  "description": "Watch on 2 screens in Standard Definition"
}

Response (200 OK):
{
  "id": 1,
  "name": "Basic Plus",
  "price_cents": 21900,
  "interval": "monthly",
  "description": "Watch on 2 screens in Standard Definition",
  "created_at": "2024-04-10T12:00:00.000Z"
}
```

---

#### 5. **DELETE /plans/:id** - Delete Plan
```
Response (200 OK):
{
  "ok": true
}

Response (404 Not Found):
{
  "error": "Plan not found"
}
```

**Note:** Cannot delete if subscriptions reference this plan (RESTRICT constraint)

---

### **Subscriptions Endpoints** (`/api/subscriptions`)

#### 1. **POST /subscriptions** - Create Subscription (Purchase Plan)
```
Request:
{
  "user_id": 1,
  "plan_id": 2,
  "status": "active",
  "months": 1
}

Response (201 Created):
{
  "id": 1,
  "user_id": 1,
  "plan_id": 2,
  "status": "active",
  "started_at": "2024-04-10",
  "ends_at": "2024-05-10",
  "auto_renew": true,
  "created_at": "2024-04-10T12:00:00.000Z",
  "updated_at": "2024-04-10T12:00:00.000Z"
}
```

**Validation:**
- user_id and plan_id required
- User must exist in database
- Plan must exist in database
- Prevents duplicate active subscriptions for same plan
- Auto-calculates end date based on months parameter

**Constraints:**
- Cannot have 2 active subscriptions for same plan
- Returns 409 if active subscription already exists

---

#### 2. **GET /subscriptions** - List All Subscriptions with Details
```
Response (200 OK):
[
  {
    "id": 1,
    "user_id": 1,
    "user_name": "John Doe",
    "email": "john@example.com",
    "plan_id": 2,
    "plan_name": "Standard",
    "price_cents": 49900,
    "status": "active",
    "started_at": "2024-04-10",
    "ends_at": "2024-05-10",
    "auto_renew": true,
    "created_at": "2024-04-10T12:00:00.000Z"
  },
  {...}
]
```

**Features:**
- JOINs with users and plans tables
- Shows user name, email, and plan details
- Sorted by creation date (DESC)
- Includes all subscription details

---

#### 3. **GET /subscriptions/:id** - Get Subscription Details
```
Response (200 OK):
{
  "id": 1,
  "user_id": 1,
  "plan_id": 2,
  "status": "active",
  "started_at": "2024-04-10",
  "ends_at": "2024-05-10",
  "auto_renew": true,
  "created_at": "2024-04-10T12:00:00.000Z"
}
```

---

#### 4. **POST /subscriptions/:id/cancel** - Cancel Subscription
```
Response (200 OK):
{
  "id": 1,
  "user_id": 1,
  "plan_id": 2,
  "status": "cancelled",
  "started_at": "2024-04-10",
  "ends_at": "2024-05-10",
  "auto_renew": true,
  "created_at": "2024-04-10T12:00:00.000Z",
  "updated_at": "2024-04-10T12:05:00.000Z"
}
```

**Features:**
- Updates subscription status to "cancelled"
- Returns updated subscription object

---

### **Payments Endpoints** (`/api/payments`)

#### 1. **POST /payments** - Process Payment & Create Subscription
```
Request:
{
  "user_id": 1,
  "plan_id": 2,
  "payment_method": "credit_card",
  "amount_cents": 49900
}

Response (201 Created):
{
  "id": 1,
  "user_id": 1,
  "plan_id": 2,
  "amount_cents": 49900,
  "payment_method": "credit_card",
  "status": "completed",
  "transaction_id": "txn_1712748000000",
  "created_at": "2024-04-10T12:00:00.000Z",
  "subscription_id": 1
}
```

**Validation:**
- user_id and plan_id required
- User must exist
- Plan must exist
- Creates subscription and returns simulated payment confirmation
- Generates transaction ID with timestamp

---

#### 2. **GET /payments** - Get Payment History
```
Response (200 OK):
[
  {
    "id": 1,
    "user_id": 1,
    "user_name": "John Doe",
    "plan_id": 2,
    "plan_name": "Standard",
    "amount_cents": 49900,
    "payment_method": "credit_card",
    "status": "completed",
    "transaction_id": "txn_1712748000000",
    "created_at": "2024-04-10T12:00:00.000Z"
  },
  {...}
]
```

**Features:**
- Pulls data from subscriptions with JOINs
- Shows all transaction details per subscription creation

---

## Frontend Components & Pages

### File Structure
```
frontend/src/
├── App.js                    # Main app component
├── index.js                  # React entry point
├── styles.css                # Global styles
└── pages/
    ├── Login.js              # Authentication page
    ├── Plans.js              # Browse subscription plans
    ├── Subscriptions.js      # User's active subscriptions
    └── Users.js              # User management (if implemented)
```

---

### 1. **App.js** - Main Application Component

**Features:**
- User authentication state management (localStorage)
- Page routing (Login, Plans, Subscriptions)
- Header with navigation
- Responsive button styling
- Loading state while checking authentication
- User logout functionality

**State Variables:**
- `user`: Current logged-in user object
- `page`: Current page (plans/subs)
- `isLoading`: Initial auth check loading state

**Flow:**
1. On mount, check localStorage for saved user
2. If user found, skip login
3. If no user, show Login page
4. When logged in, show Plans and Subscriptions pages
5. Logout clears localStorage and resets state

---

### 2. **Login.js** - User Authentication

**Features:**
1. **Registration Tab**
   - Form: Name, Email, Password
   - Calls `POST /api/users/register`
   - Validates client-side
   - Shows success/error messages
   - Auto-switches to login on success

2. **Login Tab**
   - Form: Name, Email, Password
   - Calls `POST /api/users/login`
   - Validates credentials
   - On success, calls onLogin callback
   - Stores user in localStorage

3. **Password Recovery**
   - "Forgot Password?" link option
   - Sends reset email via `/api/users/forgot-password`
   - Shows token prompt for password reset form

---

### 3. **Plans.js** - Browse & Purchase Plans

**Features:**
- Fetches all plans from `GET /api/plans`
- Displays plans in card layout
- Shows plan name, price, features, interval
- "Subscribe" button for each plan
- Creates subscription via `POST /api/subscriptions`
- Shows purchase confirmation
- Loading and error states
- Responsive grid layout

**Data Structure:**
```javascript
{
  id: number,
  name: string,
  price_cents: number,
  interval: string,
  description: string,
  created_at: string
}
```

---

### 4. **Subscriptions.js** - Manage Active Subscriptions

**Features:**
- Fetches user's subscriptions from `GET /api/subscriptions`
- Displays subscription status
- Shows subscription dates (start/end)
- "Cancel Subscription" button
- Calls `POST /api/subscriptions/:id/cancel`
- Refreshes list after cancellation
- Shows active/cancelled/expired statuses
- Loading and error states

**Subscription Display:**
- Plan name and price
- Current status badge
- Active dates
- Cancel action

---

## Key Features Implemented

### ✅ User Management
- [x] User registration with password hashing (bcryptjs)
- [x] Login authentication with name + email + password
- [x] User listing (GET all users)
- [x] Get user by ID
- [x] Password reset with token (1-hour expiration)
- [x] Forgot password email functionality
- [x] Session persistence via localStorage

### ✅ Plans Management
- [x] CRUD operations for subscription plans
- [x] 3 pre-seeded plans (Basic, Standard, Premium)
- [x] Plan details with pricing and description
- [x] Plans sorted by price

### ✅ Subscriptions
- [x] Create subscription (purchase plan)
- [x] List all subscriptions with plan details
- [x] Get subscription by ID
- [x] Cancel subscription
- [x] Status tracking (active, cancelled, expired, paused)
- [x] Auto-renew flag
- [x] Prevent duplicate active subscriptions per plan

### ✅ Payments
- [x] Payment processing (simulated)
- [x] Payment history with transaction IDs
- [x] Subscription creation via payment endpoint
- [x] Transaction ID generation

### ✅ Email Service
- [x] Password reset email via nodemailer
- [x] Confirmation email on password change
- [x] HTML formatted emails with branding
- [x] Configurable email service (Gmail default)

### ✅ Security
- [x] Password hashing with bcryptjs (10 rounds)
- [x] Unique email constraint
- [x] CORS enabled
- [x] Password reset token validation
- [x] Password minimum length (6 characters)

### ✅ Database
- [x] PostgreSQL migration from MySQL
- [x] Proper foreign key relationships
- [x] Cascade delete for users (subscriptions removed)
- [x] Restrict delete for plans (cannot delete if subscriptions exist)
- [x] Custom enum for subscription status
- [x] Connection pooling

---

## Setup Instructions

### Prerequisites
- **Node.js** 14+
- **PostgreSQL** 10+
- **npm** or **yarn**

### Backend Setup
```bash
cd backend

# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Configure environment variables
# Edit .env and set:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASS=postgres
# DB_NAME=netflix_clone

# 4. Initialize database
node init-db.js

# 5. Start development server
npm run dev
# Server runs on http://localhost:4000
```

### Frontend Setup
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start development server
npm start
# App runs on http://localhost:3000
```

### Database Initialization
```bash
cd backend

# Full reset (drops & recreates)
node reset-db.js

# Initialize with sample data
node init-db.js

# Verify users were created
node check-users.js
```

---

## Environment Variables

### `.env.example` Template
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=netflix_clone
PORT=4000
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SERVICE=gmail
```

---

## Recent Migration: MySQL → PostgreSQL

### Key Changes
1. **Driver:** `mysql2` → `pg`
2. **Connection:** Pool/createConnection → pg.Pool
3. **Query Placeholders:** `?` → `$1, $2, $3`
4. **Result Handling:** `[rows]` → `result.rows`
5. **Data Types:** AUTO_INCREMENT → SERIAL, ENUM custom type
6. **Syntax:** Backticks removed, TRUNCATE CASCADE added

### Files Modified
- backend/package.json
- backend/src/db.js
- backend/src/routes/* (all route files)
- backend/*.js (init-db, reset-db, etc.)
- db/schema.sql

**Status:** Migration complete and tested ✓

---

## Testing Scripts

### Available npm Scripts
```bash
# Backend
npm start        # Run production server
npm run dev      # Run with nodemon (auto-reload)

# Database utilities
node init-db.js           # Initialize database
node reset-db.js          # Reset to fresh state
node check-users.js       # Verify users
node test-api.js          # Test API endpoints
node test-user-api.js     # Test user endpoints

# Frontend
npm start        # Start development server
npm build        # Build for production
```

---

## Current Limitations & Future Enhancements

### Limitations
- ⚠️ Payments are simulated (no Stripe/PayPal integration)
- ⚠️ No real email service (configure Gmail/SendGrid)
- ⚠️ No multi-factor authentication (MFA)
- ⚠️ No role-based access control (admin vs user)
- ⚠️ No subscription renewal automation
- ⚠️ No payment receipts/invoicing system

### Potential Enhancements
- [ ] Integration with real payment processing (Stripe/PayPal)
- [ ] Admin dashboard for plan/user management
- [ ] Subscription renewal automation
- [ ] Invoice generation and email
- [ ] User profile customization
- [ ] Device/platform management
- [ ] Viewing history tracking
- [ ] Recommendation engine
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Unit test suite
- [ ] API rate limiting
- [ ] Advanced analytics

---

## Performance Considerations

### Database
- Indexed queries on user email (UNIQUE constraint)
- Indexed foreign keys for JOIN performance
- Connection pooling with pg
- Parameterized queries (prevent SQL injection)

### Frontend
- Lazy loading pages with React
- localStorage for session persistence
- Efficient re-renders with hooks

### Backend
- Express middleware pipeline
- Async/await for non-blocking I/O
- Error handling on all database queries
- CORS configuration

---

## Security Checklist

- [x] Password hashing (bcryptjs)
- [x] SQL injection prevention (parameterized queries)
- [x] Password reset token expiration
- [x] Email uniqueness validation
- [x] CORS enabled
- [x] Environment variables for sensitive data
- [ ] HTTPS in production
- [ ] Rate limiting
- [ ] Input validation/sanitization
- [ ] CSRF protection
- [ ] JWT tokens (could enhance)
- [ ] Multi-factor authentication

---

## Troubleshooting

### Database Connection Issues
```
Error: connect ECONNREFUSED
→ Ensure PostgreSQL is running on localhost:5432
→ Check .env file DB credentials
→ Run: psql -U postgres -d netflix_clone
```

### Backend Server Won't Start
```
Error: EADDRINUSE :::4000
→ Port 4000 already in use
→ Kill process: lsof -ti:4000 | xargs kill
→ Or use different port: PORT=5000 npm run dev
```

### Frontend Won't Load
```
Error: Connection refused to backend
→ Ensure backend server is running (npm run dev)
→ Check backend is on http://localhost:4000
→ Check CORS is enabled in backend/index.js
```

### Database Schema Error
```
Error: relation does not exist
→ Run: node init-db.js
→ Or: node reset-db.js (full reset)
```

---

## Deployment Notes

### For Production
1. **Environment:** Set NODE_ENV=production
2. **Database:** Use managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
3. **Email:** Configure real email service (Gmail, SendGrid, AWS SES)
4. **Frontend:** Build and serve static files: `npm run build`
5. **Backend:** Use process manager (PM2, forever)
6. **HTTPS:** Enable SSL certificates
7. **Secrets:** Use environment variables or secret manager
8. **Monitoring:** Add logging and error tracking (Sentry)

---

## Project Statistics

| Component | Count |
|-----------|-------|
| Backend Routes | 4 (users, plans, subscriptions, payments) |
| API Endpoints | 16+ total endpoints |
| Database Tables | 3 tables (users, plans, subscriptions) |
| Frontend Pages | 3 pages (Login, Plans, Subscriptions) |
| npm Dependencies | 14+ total (frontend + backend) |
| Code Files | 15+ source files |

---

## Document Information

**Created:** April 10, 2026  
**Last Updated:** April 10, 2026  
**Status:** Complete & Functional  
**Version:** 1.0.0

---

## Quick Links

- [README.md](README.md) - Quick start guide
- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - MySQL to PostgreSQL migration details
- [POSTGRES_SETUP.md](POSTGRES_SETUP.md) - Detailed database setup with DBeaver
- [postman_collection.json](postman_collection.json) - API collection for testing

---

## Support & Questions

For issues or questions:
1. Check [POSTGRES_SETUP.md](POSTGRES_SETUP.md) for database help
2. Review API endpoint documentation above
3. Check [Troubleshooting](#troubleshooting) section
4. Review environment variables in .env.example
