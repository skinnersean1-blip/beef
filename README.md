# Beef v2 - Peer-to-Peer Debate Platform

Beef is a social debate platform where two people can wager on their own debate through peer-to-peer escrow. The platform facilitates structured debates with multiple settlement methods.

## Key Features

### Simplified Business Model
- **Peer-to-Peer Wagering Only**: Two debaters wager against each other directly (no spectator betting)
- **Escrow System**: Platform holds funds in escrow with 1% fee
- **Max $1,000 Per Debate**: Limited liability model
- **Three Settlement Methods**:
  - 🤖 **Web Analysis**: AI fact-checking via OpenAI GPT-4
  - 👥 **Crowd Voting**: Like/dislike reactions from spectators
  - 🏳️ **Concession**: Either party can concede defeat

### Core Functionality
- 🎯 Create debate topics with ante ($1-$1000)
- 🥊 Accept open debates with matching position
- 💬 Exchange arguments (500-word limit per post)
- ⏱️ 24-hour debate duration
- 📱 Swipe or scroll interface (user selectable)
- 🔍 Algorithm-free chronological feed
- 💰 Integrated wallet system with transaction history

### Tech Stack

#### Backend
- Node.js 18+ + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT Authentication
- OpenAI GPT-4 (web analysis)
- Stripe SDK (future payment integration)

#### Frontend
- React 18 + TypeScript
- Vite 5 (build tool)
- Tailwind CSS 3 (custom mauve/brown/white theme)
- react-swipeable (swipe gestures)
- React Router 6

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
1. **Creator** posts a debate topic with position and ante ($1-$1000)
2. **Challenger** accepts by posting their counter-position and matching ante
3. **Debate begins** - 24-hour timer starts, funds held in escrow
4. **Both parties exchange arguments** (max 500 words per post, unlimited posts)
5. **Spectators** can view and react with likes/dislikes
6. **Settlement** via one of three methods:
   - **Web Analysis**: AI analyzes arguments using GPT-4 and web sources
   - **Crowd Vote**: Platform counts likes vs dislikes
   - **Concession**: Either party can concede at any time
7. **Winner receives** (total pot - 1% platform fee)

### Available Actions
- **Withdraw**: Creator can withdraw before challenger accepts (full refund)
- **Concede**: Either party can concede during active debate (opponent wins)
- **Double Down**: Raise the stakes during active debate (future feature)

### Color Theme
Custom Tailwind palette:
- **Mauve** (#8C2D64): Primary brand color
- **Brown** (#8C552D): Secondary/text color
- **White** (#FEFEFE): Background
- **Yellow** (#F4C430): Accent/CTA buttons
- **Black** (#0A0A0A): Dark text

## Legal Notice

⚠️ **Important**: This platform facilitates peer-to-peer wagering between two parties on their own debate performance. This is not a game of chance, but rather a skill-based competition. However, you should still ensure compliance with local laws regarding peer-to-peer contracts and skill-based wagering before deployment. This is an MVP and may require proper licensing and regulatory approval for production use.

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
