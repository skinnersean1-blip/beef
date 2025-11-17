# Running Beef v2 Locally

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

## Quick Start

### 1. Clone/Pull the Repository
```bash
git pull
cd beef
```

### 2. Set Up PostgreSQL Database
```bash
# Create database
createdb beef_v2

# Or using psql
psql -U postgres
CREATE DATABASE beef_v2;
\q
```

### 3. Run the SQL Schema
```bash
psql -U postgres -d beef_v2 -f backend/prisma/manual_schema.sql
```

### 4. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 5. Configure Environment Variables

**backend/.env:**
```
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/beef_v2"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
OPENAI_API_KEY="sk-your-key-here"
NODE_ENV="development"
```

**frontend/.env:**
```
VITE_API_URL="http://localhost:5000"
```

### 6. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Open in Browser
Go to: **http://localhost:5173**

## Test Credentials

These users are already in the database from our tests:
- **alice@beef.com** / password123 (has active debate)
- **bob@beef.com** / password123 (challenger)
- **charlie@beef.com** / password123 (spectator)

Or register a new account!

## What You'll See

1. **Login/Register** page with mauve/brown theme
2. **BeefFeed** with swipe/scroll toggle
3. **Active debate** about pineapple on pizza
4. **Create Beef** page to start new debates
5. **Beef Detail** page with full debate interface

Enjoy! 🔥
