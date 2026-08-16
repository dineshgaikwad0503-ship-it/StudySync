# StudySync — Collaborative Study Platform for Students

A full-stack real-time study platform: study groups, shared resource drive, live chat,
collaborative whiteboard, peer-to-peer quizzing with leaderboards, and a tutor marketplace
with booking.

## Stack
- **Frontend:** React 18 (Vite), React Router, socket.io-client, HTML5 Canvas, PeerJS
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB (Mongoose)
- **Storage:** AWS S3 (presigned uploads) with local-disk fallback for development
- **Auth:** JWT (httpOnly-friendly bearer tokens)

## Repository structure
```
studysync/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Login, Dashboard, Group, StudyRoom, Quiz, Marketplace
│       ├── components/     # Whiteboard, Chat, VideoPanel, FileDrive, Flashcards...
│       ├── context/        # AuthContext, SocketContext
│       └── lib/            # api client, socket singleton
└── server/
    ├── models/             # User, Group, Resource, Message, Quiz, Score, Tutor, Booking
    ├── routes/             # auth, groups, resources, quizzes, tutors, bookings
    ├── socket/             # ALL Socket.io logic lives here
    │   ├── index.js        # io bootstrap + auth handshake
    │   ├── chat.js         # live chat events
    │   ├── whiteboard.js   # drawing broadcast (moveTo / lineTo)
    │   ├── quiz.js         # live quiz + leaderboard events
    │   └── presence.js     # room presence + WebRTC peer signalling
    ├── middleware/         # auth, group membership, error handler
    └── config/             # db, s3
```

## Quick start
```bash
# 1. Backend
cd server
cp .env.example .env        # fill MONGO_URI + JWT_SECRET (S3 keys optional)
npm install
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Deployment notes
Real-time apps need a host that supports **WebSockets** and, when running more than one
instance, **sticky sessions**. Recommended: Render / Railway / Fly.io for the server,
Vercel or Netlify for the client.

If you scale horizontally, enable the Redis adapter:
```bash
npm i @socket.io/redis-adapter redis
# then set REDIS_URL in .env — server/socket/index.js picks it up automatically.
```

## Demo video checklist
1. Open the app in two browser windows with two different accounts.
2. Join the same study room.
3. Draw on the whiteboard in window A — show the strokes appearing live in window B.
4. Send chat messages both ways, upload a PDF, run a quiz and show the leaderboard update.
5. Book a tutor slot and show double-booking being rejected.

## Timeline mapping
| Week | Scope | Where in the code |
|---|---|---|
| 1 | Auth, group CRUD, invites, uploads | `server/routes/auth.js`, `groups.js`, `resources.js` |
| 2 | Chat + whiteboard sync | `server/socket/*`, `client/src/components/Whiteboard.jsx` |
| 3 | Quizzing engine | `server/routes/quizzes.js`, `client/src/pages/QuizPage.jsx` |
| 4 | Tutor marketplace + booking | `server/routes/tutors.js`, `bookings.js` |
