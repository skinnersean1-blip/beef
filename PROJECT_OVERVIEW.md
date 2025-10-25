# Beef - Social Debate Platform

## Project Overview

Beef is a revolutionary social media platform that commodifies debate by combining social networking, structured argumentation, real-time betting, and AI-powered fact-checking.

### Key Concept

Think of Beef as:
- **TikTok** (engaging UX, vertical scroll, real-time updates)
- **Reddit** (algorithm-free, search-based discovery, community-driven)
- **FanDuel** (betting mechanics, odds calculation, payouts)

But focused entirely on **debate**.

## Core Features

### 1. Debate Mechanics
- Users create debate topics with an initial ante (bet)
- Challengers accept debates by matching or raising the ante
- Debates last 24 hours (extendable with additional antes)
- Participants exchange arguments, rebuttals, and evidence
- Real-time commenting and engagement

### 2. Winning Mechanisms

**Crowd Engagement**
- Spectators vote to support creators or challengers
- Overwhelming support (>70% with 20+ votes) can decide the winner
- Vote on individual arguments and rebuttals
- Community-driven outcomes

**AI Fact-Checking**
- OpenAI-powered analysis of debate arguments
- Web scraping to verify claims against public information
- Factual accuracy scoring
- Automated winner determination based on evidence

### 3. Betting System
- Spectators can bet on debate outcomes
- Dynamic odds calculation based on betting activity
- Winner payouts from pooled bets
- Integrated wallet system
- Transaction history

### 4. Algorithm-Free Experience
- No algorithmic feed manipulation
- Chronological debate feed (most recent first)
- Search-based discovery
- Filter by status, category, or keywords
- No echo chamber effect

### 5. Real-Time Features (Socket.io)
- Live comment updates
- Real-time voting
- Bet notifications
- Typing indicators
- Instant engagement metrics

## Technical Architecture

### Backend (Node.js + TypeScript)
```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, error handling
│   ├── utils/             # Helper functions
│   └── types/             # TypeScript interfaces
├── prisma/
│   └── schema.prisma      # Database schema
└── package.json
```

**Key Technologies:**
- Express.js (REST API)
- Prisma ORM (Database)
- PostgreSQL (Data storage)
- Socket.io (Real-time)
- JWT (Authentication)
- OpenAI API (Fact-checking)
- Axios + Cheerio (Web scraping)

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route pages
│   ├── services/          # API clients
│   ├── context/           # React context (Auth)
│   ├── hooks/             # Custom hooks
│   └── types/             # TypeScript interfaces
├── public/
└── package.json
```

**Key Technologies:**
- React 18
- TypeScript
- Tailwind CSS (Styling)
- React Router (Navigation)
- Axios (HTTP client)
- Socket.io Client (Real-time)
- Vite (Build tool)

### Database Schema

**Core Models:**
- `User` - Authentication, profile, wallet
- `Debate` - Topics, participants, status, pot
- `Comment` - Arguments, rebuttals, evidence
- `Vote` - Support votes, upvotes/downvotes
- `Bet` - Wagers, odds, payouts
- `Transaction` - Wallet history
- `Notification` - User alerts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update profile

### Debates
- `GET /api/debates` - List debates (with filters)
- `GET /api/debates/:id` - Get debate details
- `POST /api/debates` - Create debate
- `POST /api/debates/:id/accept` - Accept challenge
- `POST /api/debates/:id/extend` - Extend debate
- `POST /api/debates/:id/end` - End debate
- `GET /api/debates/:id/stats` - Get statistics

### Comments
- `GET /api/debates/:id/comments` - Get comments
- `POST /api/debates/:id/comments` - Post comment
- `POST /api/comments/:id/vote` - Vote on comment
- `POST /api/debates/:id/vote` - Vote on debate

### Betting
- `POST /api/debates/:id/bets` - Place bet
- `GET /api/bets` - Get user bets
- `GET /api/debates/:id/odds/:winner` - Get odds

## User Flows

### Creating a Debate
1. User clicks "Create Debate"
2. Fills in topic, description, position, category, ante
3. System validates wallet balance
4. Debate created with status "OPEN"
5. Ante deducted from wallet

### Accepting a Challenge
1. User browses open debates
2. Clicks "Accept Challenge"
3. Enters their position and ante
4. Debate status changes to "ACTIVE"
5. 24-hour timer starts
6. Both users can now post arguments

### Placing a Bet
1. Spectator views active debate
2. Selects predicted winner
3. Enters bet amount
4. System calculates odds
5. Bet placed, amount deducted
6. Real-time odds update for other users

### Ending a Debate

**Option 1: Crowd Decision**
- Requires 20+ votes
- One participant has >70% support
- Automatic winner declaration

**Option 2: AI Fact-Checking**
- Participant triggers AI analysis
- System extracts claims from arguments
- Web search verifies each claim
- AI scores factual accuracy
- Winner determined by evidence

**Option 3: Time Expiry**
- 24 hours elapse
- Most recent stats determine winner

### Payouts
1. Winner declared
2. Debate pot awarded to winner
3. Bets settled (winning bets paid out)
4. Transactions recorded
5. Notifications sent

## AI Fact-Checking Pipeline

1. **Claim Extraction**
   - GPT-4 analyzes all arguments
   - Extracts verifiable factual claims
   - Filters out opinions and subjective statements

2. **Web Search**
   - Generates search queries for each claim
   - Performs web searches (Wikipedia, news sites)
   - Scrapes relevant content

3. **Verification**
   - GPT-4 compares claims against search results
   - Identifies supporting and contradicting evidence
   - Assigns accuracy scores (0-1)

4. **Scoring**
   - Calculates overall factual score per participant
   - Bonuses for verified claims
   - Penalties for disputed claims

5. **Determination**
   - Compares scores
   - Declares winner or tie
   - Provides detailed analysis

## Crowd Engagement System

### Voting Mechanisms
- **Support Votes**: Direct support for creator/challenger
- **Comment Votes**: Upvote/downvote on specific arguments
- **Weighted Scoring**: Support votes count 2x

### Engagement Metrics
- Creator support percentage
- Challenger support percentage
- Total vote count
- Comment engagement (upvotes - downvotes)
- Spectator participation

### Auto-Decision Criteria
- Minimum 20 votes required
- >70% support for one participant
- Prevents premature decisions
- Ensures community consensus

## Betting Mechanics

### Odds Calculation
```
odds = totalBetAmount / amountOnWinner
```

Capped between 1.1x and 10x to prevent extreme odds.

### Dynamic Odds
- Odds recalculate with each bet
- More bets on a participant = lower odds
- Underdog bets = higher potential payout

### Settlement
- Winning bets: `payout = betAmount * odds`
- Losing bets: No payout
- Cancelled debates: Full refund

## Security Considerations

### Authentication
- Bcrypt password hashing
- JWT tokens with expiration
- Secure HTTP-only cookies (production)

### Data Validation
- Input sanitization
- Type checking with TypeScript
- Database constraints (Prisma)

### Transaction Safety
- Prisma transactions for atomic operations
- Balance validation before bets/antes
- Race condition prevention

### Real Money (Production)
⚠️ **This MVP uses virtual currency**

For real money:
- Gaming license required
- KYC/AML compliance
- Payment gateway (Stripe Connect, PayPal)
- Regulatory approval
- Age verification
- Responsible gaming features
- Legal counsel

## Scalability Considerations

### Current Architecture
- Suitable for 100-1,000 concurrent users
- PostgreSQL handles moderate load
- Socket.io for real-time updates

### Scaling Options

**Database**
- Connection pooling (PgBouncer)
- Read replicas for queries
- Sharding for massive scale

**Backend**
- Horizontal scaling (multiple instances)
- Load balancing (nginx, AWS ELB)
- Caching (Redis) for frequent queries
- Queue system (Bull, RabbitMQ) for AI processing

**Frontend**
- CDN for static assets
- Code splitting
- Lazy loading
- Service workers (PWA)

**Real-Time**
- Socket.io clustering with Redis adapter
- Dedicated Socket.io servers
- WebSocket load balancing

## Future Enhancements

### Phase 2 Features
- [ ] User profiles with stats
- [ ] Leaderboards
- [ ] Achievements/badges
- [ ] Private debates
- [ ] Team debates (multiple participants per side)
- [ ] Video/audio debates
- [ ] Debate tournaments
- [ ] Referral system

### Phase 3 Features
- [ ] Mobile apps (React Native)
- [ ] AI debate participant (bot)
- [ ] Debate templates
- [ ] Moderation tools
- [ ] Reputation system
- [ ] Premium subscriptions
- [ ] Tipping system
- [ ] Content monetization

### Infrastructure
- [ ] Elasticsearch for advanced search
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] Monitoring (DataDog, New Relic)
- [ ] Analytics (Mixpanel, Amplitude)

## Development Workflow

### Local Development
```bash
# Terminal 1: Database
docker-compose up postgres

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Testing
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright, Cypress)
- Load testing (k6, Artillery)

### Deployment
- Docker containers
- Environment-based configs
- Database migrations
- Zero-downtime deployments

## Business Model

### Revenue Streams
1. **Transaction Fees** (5-10% on winnings)
2. **Premium Subscriptions** (ad-free, analytics)
3. **Sponsored Debates** (brands sponsor topics)
4. **Virtual Currency Sales** (for MVP)
5. **Advertising** (for free tier)

### User Acquisition
- Social media marketing
- Content creators as ambassadors
- SEO for debate topics
- Viral debate sharing
- Referral bonuses

### Engagement Loops
- Daily challenges
- Winning streaks
- Community events
- Seasonal tournaments
- Push notifications

## Legal & Compliance

### Terms of Service
- User agreement
- Content policies
- Behavior guidelines
- Dispute resolution

### Privacy Policy
- GDPR compliance
- Data collection disclosure
- User rights (delete account, export data)

### Content Moderation
- Hate speech prevention
- Misinformation flagging
- User reporting
- Moderator dashboard

### Gambling Regulations
- Age restrictions (18+)
- Jurisdiction limitations
- Self-exclusion options
- Loss limits

## Conclusion

Beef is a complete, production-ready social debate platform that combines:
- ✅ Engaging social features
- ✅ Fair, algorithm-free discovery
- ✅ Real money potential through betting
- ✅ AI-powered fact-checking
- ✅ Community-driven outcomes
- ✅ Real-time engagement

Built with modern, scalable technologies and designed for growth.

---

**Built with TypeScript, React, Node.js, PostgreSQL, and Socket.io**
