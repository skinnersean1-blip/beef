# Beef Platform - Setup Guide

🔥 **Welcome to Beef!** This guide will help you get the debate platform running on your Mac.

## Prerequisites

- macOS 10.15 or later
- Homebrew installed

## Quick Start

Follow these steps **in order**:

### 1. Install PostgreSQL and Node.js

```bash
brew install postgresql@14 node
brew services start postgresql@14
```

### 2. Clone and Navigate to Project

```bash
cd ~/beef
```

### 3. Create Database

```bash
sleep 3
createdb beef
```

### 4. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env <<'ENVFILE'
PORT=5000
DATABASE_URL="postgresql://localhost:5432/beef?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
ENVFILE

# Run database migrations
npx prisma generate
npx prisma migrate dev --name init

# Start backend (in background)
npm run dev > ~/beef-backend.log 2>&1 &
echo "Backend started! Check logs at ~/beef-backend.log"
```

### 5. Set Up Frontend (in a new Terminal window)

```bash
cd ~/beef/frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

### 6. Open Beef

Once you see "VITE ready" in Terminal, open your browser to:

**http://localhost:5173**

## Features

- 💬 **Algorithm-Free Feed** - Chronological debates, no echo chamber
- 💰 **Betting System** - Spectators can bet on debate outcomes
- 🤖 **AI Fact-Checking** - GPT-4 powered verification (requires OpenAI API key)
- 👥 **Crowd Voting** - Community decides winners with 70%+ support
- ⏰ **24-Hour Debates** - Extendable with additional antes
- 💸 **Wallet System** - Track your winnings and losses

## Troubleshooting

### Port 5000 Already in Use

If you see "port 5000 already in use", disable AirPlay Receiver:
- System Settings → General → AirDrop & Handoff → Turn OFF "AirPlay Receiver"

### Backend Won't Start

Check the logs:
```bash
tail -f ~/beef-backend.log
```

### Database Connection Errors

Make sure PostgreSQL is running:
```bash
brew services list
brew services restart postgresql@14
```

### Fresh Start

To reset everything:
```bash
# Stop processes
pkill -f nodemon
pkill -f vite

# Drop and recreate database
dropdb beef
createdb beef

# Re-run migrations
cd ~/beef/backend
npx prisma migrate dev --name init
```

## User Guide

### Creating Your First Debate

1. Register an account (you start with $100)
2. Click "Start a Beef"
3. Enter topic, your position, and ante amount
4. Wait for a challenger to accept

### Accepting a Challenge

1. Browse the feed for OPEN debates
2. Click on a debate
3. Enter your opposing position
4. Click "Accept Debate" (you must match the ante)

### Placing Bets

1. Find an ACTIVE debate
2. Select who you think will win
3. Enter bet amount
4. Click "Place Bet"

### Winning Conditions

**Crowd Support (Auto-Win)**
- Get 70%+ support from 20+ votes during the debate

**AI Verification**
- At debate end, use AI fact-checking
- Claims are verified against GPT-4 knowledge
- Most verified claims wins

## Default Accounts for Testing

Create these accounts to test:
- Email: alice@test.com / Password: password123
- Email: bob@test.com / Password: password123

## Next Steps

- Add your OpenAI API key to `.env` for AI fact-checking
- Customize the initial wallet balance in `authController.ts`
- Adjust crowd win threshold in `crowdEngagementService.ts`

---

**Need Help?** Check the logs, read error messages, or review the code comments.

**Happy Debating! 🔥**
