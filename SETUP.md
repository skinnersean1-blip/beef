# Beef Platform - Setup Guide

This guide will help you set up and run the Beef debate platform locally.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

Or use Docker (recommended for quick setup):
- Docker
- Docker Compose

## Quick Start with Docker

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone <your-repo-url>
cd beef

# Start all services
docker-compose up
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 5000
- Frontend app on port 5173

Access the app at: http://localhost:5173

## Manual Setup

### 1. Database Setup

Install and start PostgreSQL, then create a database:

```bash
createdb beef
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your configuration:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (random secret key)
# - OPENAI_API_KEY (for AI fact-checking)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start the backend server
npm run dev
```

The backend will start on http://localhost:5000

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env if needed (defaults should work for local development)

# Start the frontend development server
npm run dev
```

The frontend will start on http://localhost:5173

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/beef?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Database Migrations

To create a new migration after changing the Prisma schema:

```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

To reset the database:

```bash
npx prisma migrate reset
```

To view data in Prisma Studio:

```bash
npx prisma studio
```

## Testing the Application

1. **Register a new account**
   - Go to http://localhost:5173
   - Click "Sign Up"
   - Create an account (you'll get $100 starting balance)

2. **Create a debate**
   - Click "Create Debate"
   - Fill in the topic, description, your position, and ante
   - Submit

3. **Accept a challenge** (with a second account)
   - Register another account
   - Find the open debate on the home page
   - Click "Accept Challenge"
   - Enter your position and ante

4. **Place bets** (as a spectator)
   - Create a third account
   - Navigate to an active debate
   - Place a bet on who you think will win

5. **Engage in debate**
   - Post arguments, rebuttals, and evidence
   - Vote on who's winning
   - Watch real-time updates

## Features to Test

### Core Features
- ✅ User registration and authentication
- ✅ Create debates with antes
- ✅ Accept debate challenges
- ✅ Post comments and arguments
- ✅ Vote on debates and comments
- ✅ Place bets on debate outcomes
- ✅ Real-time updates via Socket.io
- ✅ Search debates
- ✅ Filter by status and category

### AI Fact-Checking
To test AI fact-checking, you'll need an OpenAI API key:
1. Get an API key from https://platform.openai.com
2. Add it to backend/.env as `OPENAI_API_KEY`
3. End a debate with "Use AI" option

### Crowd Engagement
- Post spectator comments
- Vote to support creator or challenger
- When a debater gets >70% support with 20+ votes, they can be declared the winner

## Production Deployment

### Important Security Steps

1. **Change all secrets**
   - Generate a strong JWT_SECRET
   - Use secure database passwords
   - Never commit .env files

2. **Set up SSL/TLS**
   - Use HTTPS for production
   - Configure reverse proxy (nginx/Apache)

3. **Database**
   - Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
   - Set up automated backups
   - Configure connection pooling

4. **Environment Variables**
   - Set NODE_ENV=production
   - Configure production database URL
   - Set FRONTEND_URL to your domain

5. **Betting Compliance**
   ⚠️ **CRITICAL**: Real-money betting requires:
   - Gaming licenses in your jurisdiction
   - KYC/AML compliance
   - Payment processor integration (not just Stripe)
   - Legal counsel
   - Age verification
   - Responsible gaming features

### Deployment Options

**Option 1: Traditional Hosting**
- Backend: Deploy to Heroku, DigitalOcean, AWS EC2
- Frontend: Deploy to Vercel, Netlify, or serve via backend
- Database: AWS RDS, DigitalOcean Managed Database

**Option 2: Docker/Kubernetes**
- Build production Docker images
- Deploy to AWS ECS, Google Cloud Run, or Kubernetes cluster
- Use managed database service

**Option 3: Serverless**
- Backend: AWS Lambda, Google Cloud Functions
- Frontend: Vercel, Netlify
- Database: PlanetScale, Supabase

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify connection string in .env
# Make sure DATABASE_URL format is correct
```

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill

# Or use different port in .env
```

### Prisma Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset
```

### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

1. **Database Seeding**: Create a seed script to populate test data
2. **API Testing**: Use Postman or Thunder Client to test endpoints
3. **Hot Reload**: Both frontend and backend support hot reload
4. **Debugging**: Use VS Code debugger for backend
5. **Logging**: Check console logs for real-time Socket.io events

## Support

For issues or questions:
- Check existing GitHub issues
- Review the code comments
- Check the main README.md

## License

MIT License - See LICENSE file for details
