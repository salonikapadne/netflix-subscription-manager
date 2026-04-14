# Netflix Subscription Manager (Example)

Full-stack example project using Node.js + Express + **PostgreSQL** for backend and React for frontend.

## Features

- Plans management (CRUD)
- Users and subscriptions
- Simple mock "payment" endpoint
- Authentication is minimal (email-based mock)
- **PostgreSQL database** with DBeaver support
- RESTful API endpoints

## Database

⚠️ **Updated to PostgreSQL** - Previously used MySQL. See [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) for details.

### Quick Database Setup

```bash
# Initialize with sample data
cd backend
node init-db.js

# Or reset existing database
node reset-db.js
```

**For detailed setup instructions with DBeaver, see [POSTGRES_SETUP.md](POSTGRES_SETUP.md)**

## How to Run

### Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Install dependencies  
npm install

# Initialize database
node init-db.js

# Start development server
npm run dev
```

**Requires:**
- PostgreSQL 10+ running on localhost:5432
- Node.js 14+

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Runs on `http://localhost:3000`

## API Endpoints

The backend runs on `http://localhost:4000`

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID

### Plans
- `GET /api/plans` - List all plans
- `GET /api/plans/:id` - Get plan by ID
- `POST /api/plans` - Create plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Subscriptions
- `GET /api/subscriptions` - List all subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create subscription
- `POST /api/subscriptions/:id/cancel` - Cancel subscription

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments` - Get payment history

## Project Structure

```
netflix-subscription-manager/
├── backend/
│   ├── src/
│   │   ├── db.js              # PostgreSQL connection pool
│   │   └── routes/            # API endpoint handlers
│   ├── init-db.js             # Database initialization
│   ├── setup-db.js            # Database setup & seed
│   ├── reset-db.js            # Database reset
│   ├── check-users.js         # Connection test
│   └── index.js               # Express server
├── frontend/
│   ├── src/
│   │   ├── pages/             # React components
│   │   ├── App.js
│   │   └── index.js
│   └── public/
├── db/
│   └── schema.sql             # PostgreSQL schema
├── POSTGRES_SETUP.md          # PostgreSQL & DBeaver setup guide
├── MIGRATION_SUMMARY.md       # MySQL → PostgreSQL migration details
└── README.md                  # This file
```

## Environment Variables

Create `backend/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=netflix_clone
PORT=4000
```

## Database Tools

### DBeaver (Recommended)

Connect to PostgreSQL visually:
1. Download: https://dbeaver.io
2. Create connection to `127.0.0.1:5432`
3. Browse `netflix_clone` database
4. Execute SQL queries
5. Manage tables and data

See [POSTGRES_SETUP.md](POSTGRES_SETUP.md) for detailed DBeaver instructions.

### psql CLI

```bash
# Connect to database
psql -U postgres -d netflix_clone

# List tables
\dt

# Exit
\q
```

## Troubleshooting

**PostgreSQL not running?**
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows - Check Services app
```

**Connection refused?**
- Check `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS` in `.env`
- Verify PostgreSQL is running
- See [POSTGRES_SETUP.md](POSTGRES_SETUP.md) troubleshooting section

**Database already exists?**
```bash
node reset-db.js
```

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL 10+
- **Database Client:** pg v8.10.0
- **Frontend:** React
- **Database GUI:** DBeaver (optional)

## Notes

- This is an example project for learning
- Authentication is basic (email-based)
- Payment processing is mocked
- Not suitable for production without security hardening

## Additional Resources

- [POSTGRES_SETUP.md](POSTGRES_SETUP.md) - Complete PostgreSQL setup guide
- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - Details of MySQL → PostgreSQL migration
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)







## commands ------------
## backend
cd backend
cp .env.example .env  # Adjust if needed
npm install
npm run dev           # Start server
### node init-db.js ----> # Initialize database
## frontend
cd frontend
npm install (first time)
npm start