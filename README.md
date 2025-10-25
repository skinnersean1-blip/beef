# Beef - Social Debate Platform

Beef is a revolutionary social media platform that commodifies debate by combining:
- **Debate Platform**: Post topics and engage in structured debates
- **Betting System**: Ante up and win based on performance
- **Crowd Engagement**: Community-driven outcomes
- **AI Fact-Checking**: Automated verification using web data
- **Algorithm-Free Feed**: Search-based discovery like Reddit
- **Modern UX**: TikTok feel + Reddit readability + FanDuel betting

## Features

### Core Functionality
- 🎯 Create debate topics with antes (bets)
- 🥊 Challenge and accept debates with counter-bets
- 👥 Spectator betting on debate outcomes
- ⏱️ 24-hour debates (extendable with additional antes)
- 🤖 AI-powered fact-checking via webscraping
- 📊 Crowd engagement metrics for determining winners
- 🔍 Search-based discovery (no algorithmic feed)
- 💰 Integrated wallet system

### Tech Stack

#### Backend
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Socket.io (real-time features)
- JWT Authentication
- OpenAI API (fact-checking)

#### Frontend
- React + TypeScript
- Vite (build tool)
- Tailwind CSS
- Socket.io Client
- React Router

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd beef
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Start the backend server
```bash
npm run dev
```

6. Install frontend dependencies (in a new terminal)
```bash
cd frontend
npm install
```

7. Start the frontend development server
```bash
npm run dev
```

## Project Structure

```
beef/
├── backend/           # Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## How Beef Works

### Debate Flow
1. User creates a debate topic with an ante
2. Challenger accepts and matches/raises the ante
3. Debate begins (24-hour timer starts)
4. Participants exchange arguments
5. Spectators can bet on outcomes
6. Winner determined by:
   - Crowd engagement (likes, support)
   - AI fact-checking (optional)
7. Payouts distributed to winners

### Winning Criteria
- **Crowd Support**: Overwhelming community engagement
- **AI Verification**: Fact-checked against internet data
- **Time Extension**: Debates can be extended with new antes

## Legal Notice

⚠️ **Important**: This platform involves betting with real money. Ensure compliance with local gambling laws and regulations before deployment. This is an MVP and requires proper licensing, KYC/AML procedures, and regulatory approval for production use.

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
