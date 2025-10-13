# Netflix Subscription Manager (Example)
Full-stack example project using Node.js + Express + MySQL for backend and React for frontend.
Features:
- Plans management (CRUD)
- Users and subscriptions
- Simple mock "payment" endpoint
- Authentication is minimal (email-based mock)

How to run:
1. Backend:
   - cd backend
   - cp .env.example .env  (edit DB credentials)
   - npm install
   - Run the SQL script in `db/schema.sql` to create database and seed data.
   - npm run dev
2. Frontend:
   - cd frontend
   - npm install
   - npm start
