# Quick Start Guide - Running Beef Locally

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL installed and running
- ✅ Git installed

**OR** just have Docker installed (easier option)

## Option 1: Docker (Easiest - Recommended)

### Step 1: Navigate to the project
```bash
cd beef
```

### Step 2: Start all services
```bash
docker-compose up
```

This will:
- Start PostgreSQL database on port 5432
- Start backend API on port 5000
- Start frontend on port 5173

### Step 3: Open your browser
Go to: **http://localhost:5173**

That's it! The app is running.

To stop: Press `Ctrl+C`

---

## Option 2: Manual Setup (More Control)

### Step 1: Set up PostgreSQL

#### On macOS:
```bash
# Install PostgreSQL
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb beef
```

#### On Ubuntu/Debian:
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo service postgresql start

# Create database
sudo -u postgres createdb beef
```

#### On Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install and start the service
3. Use pgAdmin to create a database named "beef"

### Step 2: Backend Setup

```bash
# Navigate to backend
cd beef/backend

# Install dependencies (this may take 2-3 minutes)
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use any text editor
```

**Edit the .env file** with your configuration:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/beef?schema=public"
JWT_SECRET=your-random-secret-key-12345
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-your-openai-key-here  # Optional, for AI fact-checking
FRONTEND_URL=http://localhost:5173
```

**Important**:
- Replace `postgres:postgres` with your PostgreSQL username:password
- Generate a random JWT_SECRET (any long random string)
- OpenAI key is optional but needed for AI fact-checking

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start backend server
npm run dev
```

You should see:
```
╔══════════════════════════════════════╗
║     🥊 Beef Server Running 🥊       ║
╠══════════════════════════════════════╣
║  Port: 5000                          ║
║  Environment: development            ║
║  Socket.io: Enabled                  ║
╚══════════════════════════════════════╝
```

### Step 3: Frontend Setup

Open a **NEW TERMINAL** (keep backend running):

```bash
# Navigate to frontend
cd beef/frontend

# Install dependencies (this may take 2-3 minutes)
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Open the App

Open your browser and go to: **http://localhost:5173**

---

## First-Time Usage

### 1. Create an Account
- Click "Sign Up"
- Fill in your details
- You'll automatically get $100 starting balance

### 2. Create Your First Debate
- Click "Create Debate" button
- Enter topic, description, your position
- Choose a category and ante amount
- Submit!

### 3. Test with Multiple Accounts
To fully test the platform, create 2-3 accounts:
- **Account 1**: Create a debate
- **Account 2**: Accept the challenge
- **Account 3**: Place bets as a spectator

Use different browsers or incognito windows for multiple accounts.

---

## Troubleshooting

### Port Already in Use
If you see "Port 5000 is already in use":

```bash
# Find what's using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or use a different port in backend/.env
PORT=5001
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
# macOS:
brew services list

# Linux:
sudo service postgresql status

# Check your DATABASE_URL in .env matches your PostgreSQL setup
```

### Prisma Errors
```bash
# Regenerate Prisma client
cd backend
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend Shows Blank Page
- Check browser console for errors (F12)
- Ensure backend is running on port 5000
- Check .env files are created

---

## Testing the Platform

### Test Scenario 1: Create and Accept Debate
1. Register as User A
2. Create a debate with $10 ante
3. Logout
4. Register as User B
5. Accept the debate with $10 ante
6. Both users can now post arguments

### Test Scenario 2: Betting
1. Register as User C (spectator)
2. Browse to an active debate
3. Place a bet on who will win
4. Watch the odds update in real-time

### Test Scenario 3: Crowd Voting
1. As spectator, vote to support creator or challenger
2. Vote on individual comments
3. When someone gets >70% support (20+ votes), they can win

### Test Scenario 4: AI Fact-Checking
1. Ensure OPENAI_API_KEY is set in backend/.env
2. In an active debate, have participants post factual claims
3. Click "End Debate" and select "Use AI"
4. AI will verify claims against web data

---

## Viewing the Database

To see your data in a GUI:

```bash
cd backend
npx prisma studio
```

Opens at: http://localhost:5555

You can browse all tables, edit data, and see relationships.

---

## Stopping the Application

### Docker:
```bash
# Press Ctrl+C in the terminal
# Then remove containers:
docker-compose down
```

### Manual:
- Press `Ctrl+C` in both terminal windows (frontend and backend)

---

## Next Steps

1. ✅ Read PROJECT_OVERVIEW.md for technical details
2. ✅ Read SETUP.md for production deployment
3. ✅ Explore the API at http://localhost:5000/health
4. ✅ Customize the platform to your needs

---

## Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Review the error messages carefully
3. Check that all prerequisites are installed
4. Ensure all .env files are created and configured
5. Try the Docker option if manual setup fails

## Development Tips

- Backend logs appear in the terminal where you ran `npm run dev`
- Frontend errors show in browser console (F12)
- Database errors are usually connection or migration issues
- Socket.io connection issues mean backend isn't running

---

**You're now ready to start debating!** 🥊
