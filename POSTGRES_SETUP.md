# PostgreSQL Setup Guide for Netflix Subscription Manager

This guide explains how to set up and use PostgreSQL with DBeaver for the Netflix Subscription Manager application.

## Prerequisites

1. **PostgreSQL Server** installed and running
   - Default port: `5432`
   - Default user: `postgres`
   - Default password: `postgres`

2. **DBeaver** (or any PostgreSQL client)
   - Download from: https://dbeaver.io/download/

3. **Node.js** (v14 or higher) with npm

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user (default password: `postgres`)
4. Keep the default port as `5432`

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=netflix_clone
PORT=4000
```

**Note:** Adjust `DB_PASS` if you used a different password during PostgreSQL installation.

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

The `pg` package (PostgreSQL client) will be installed automatically.

## Step 4: Initialize the Database

Choose one of the following methods:

### Option A: Using init-db.js (Recommended)
```bash
npm run init-db
# or
node init-db.js
```

This script will:
- Drop the existing database (if any)
- Create a new `netflix_clone` database
- Create all required tables
- Insert sample data

### Option B: Using Schema File
```bash
psql -U postgres -d postgres -f db/schema.sql
```

### Option C: Using DBeaver (GUI Method)
See instructions below under "Connecting with DBeaver"

## Step 5: Verify Database Setup

```bash
node check-users.js
```

This will connect to the database and display all users, then test inserting a new user.

## Step 6: Start the Backend Server

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The API will be available at `http://localhost:4000`

## Connecting with DBeaver

### 1. Open DBeaver and Create New Connection

1. Click **Database** → **New Database Connection**
2. Select **PostgreSQL**
3. Click **Next**

### 2. Configure Connection Parameters

Fill in the following details:

| Field | Value |
|-------|-------|
| **Server Host** | 127.0.0.1 (or localhost) |
| **Port** | 5432 |
| **Database** | postgres (initially) |
| **Username** | postgres |
| **Password** | postgres |
| **Save password locally** | ✓ (checked) |

### 3. Test Connection

Click **Test Connection...** button
- If successful, you'll see ✓ Connected
- If failed, verify PostgreSQL is running and credentials are correct

### 4. Finish Setup

Click **Finish** to save the connection

### 5. Connect and Create netflix_clone Database

1. In DBeaver, expand the PostgreSQL connection
2. Right-click on **Databases** folder
3. Select **Create New Database**
4. Name: `netflix_clone`
5. Click **Create**

### 6. Initialize Tables

Once the database is created:

1. Right-click on `netflix_clone` database
2. Select **SQL Editor** → **New SQL Script**
3. Copy the contents of `db/schema.sql`
4. Paste into the SQL editor in DBeaver
5. Click **Execute** (or press Ctrl+Enter)

### 7. Browse Data in DBeaver

Expand the `netflix_clone` database to see tables:
- **users** - Netflix users
- **plans** - Subscription plans
- **subscriptions** - User subscriptions
- **platforms** (multi-platform DB) - Streaming platforms

## Database Files

### Key Files

- **`backend/src/db.js`** - PostgreSQL connection pool configuration
- **`backend/.env.example`** - Environment variables template
- **`db/schema.sql`** - Database schema for PostgreSQL
- **`backend/init-db.js`** - Database initialization script
- **`backend/setup-db.js`** - Database setup and seed data
- **`backend/reset-db.js`** - Reset database to initial state

### Initialization Scripts

| Script | Purpose |
|--------|---------|
| `init-db.js` | Create database and tables with sample data |
| `setup-db.js` | Reset and seed database tables |
| `reset-db.js` | Drop and recreate entire database |
| `check-users.js` | Test database connection and display users |

## API Endpoints

Once the server is running, test the API:

```bash
# Get all plans
curl http://localhost:4000/api/plans

# Get all users
curl http://localhost:4000/api/users

# Get all subscriptions
curl http://localhost:4000/api/subscriptions

# Register a new user
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

## Common Issues & Troubleshooting

### PostgreSQL Server Not Running

**Error:** `connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
- **Windows:** Start the PostgreSQL service via Services app
- **macOS:** `brew services start postgresql`
- **Linux:** `sudo systemctl start postgresql`

### Authentication Failed

**Error:** `FATAL: password authentication failed for user "postgres"`

**Solution:**
- Verify `DB_PASS` in `.env` matches your PostgreSQL password
- Reset PostgreSQL password:
  ```bash
  sudo -u postgres psql
  \password postgres
  ```

### Database Already Exists

**Error:** `database "netflix_clone" already exists`

**Solution:**
```bash
# Option 1: Use reset-db.js (recommended)
node reset-db.js

# Option 2: Drop manually in DBeaver
# Right-click database → Delete Database
```

### Port 5432 Already in Use

**Error:** `EADDRINUSE: address already in use :::5432`

**Solution:**
- Change `DB_PORT` in `.env`
- Or kill the process using port 5432:
  - **Windows:** `netstat -ano | findstr :5432` then `taskkill /PID <PID> /F`
  - **macOS/Linux:** `lsof -i :5432` then `kill -9 <PID>`

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Initialize database
node init-db.js

# 3. Start server
npm start

# 4. Test API
curl http://localhost:4000/api/plans
```

## Multi-Platform Database

For the multi-platform subscription tracker, run:

```bash
node setup-multiplatform-db.js
```

This creates a `subscription_tracker` database with additional platforms:
- Netflix
- Amazon Prime Video
- JioCinema
- ZEE5
- YouTube Premium

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [DBeaver Documentation](https://dbeaver.io/docs/)
- [pg (Node.js PostgreSQL client)](https://node-postgres.com/)
- [PostgreSQL vs MySQL](https://www.postgresql.org/about/press/features.2124/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review PostgreSQL server logs
3. Verify connection parameters in `.env`
4. Test with DBeaver to isolate issues
