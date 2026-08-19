# StudySync — Real-Time Collaborative Study Platform

StudySync recreates the "library study group" experience online. It combines study groups, resource sharing, real-time chat, collaborative whiteboard, quizzes/leaderboards, and a tutor marketplace.

## Stack
- Frontend: React + Vite + Bootstrap + Socket.io Client + HTML5 Canvas
- Backend: Node.js + Express + Socket.io
- Database: MongoDB + Mongoose
- Storage: AWS S3 (optional production configuration; local uploads work in demo mode)
- Auth: JWT + bcrypt
- Video: WebRTC/PeerJS-ready architecture (optional)
- Deployment: Render-compatible backend + Vercel/Netlify-compatible frontend

## Project layout
```text
StudySync/
├── client/              React frontend
├── server/              Express REST API
├── socket/              Socket.io event handlers
├── docs/                architecture and deployment notes
├── demo/                demo checklist
├── .gitignore
└── README.md
```

## Requirements
Node.js 20+ recommended, npm 10+, MongoDB Atlas account for production, Git/GitHub.

## Run locally

### 1. Backend
```bash
cd server
npm install
copy .env.example .env
npm run dev
```
Linux/macOS:
```bash
cp .env.example .env
npm run dev
```

Backend default: http://localhost:5000

### 2. Frontend
Open a second terminal:
```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Frontend default: http://localhost:5173

### Demo account
Create an account from the Register page. Do not hard-code real credentials.

## Environment variables

Server `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studysync
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

Client `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### MongoDB Atlas
1. Create a free Atlas cluster.
2. Create a database user.
3. Configure Network Access for your development/deployment environment.
4. Click Connect → Drivers.
5. Copy the `mongodb+srv://...` connection string.
6. Put it in `MONGODB_URI`.
7. Never commit `.env`.

## Features included
- JWT registration/login
- Group creation, listing and membership
- Invite link generation
- Group resource metadata
- Local demo file upload endpoint
- S3 adapter scaffold
- Socket.io room chat
- Collaborative Canvas whiteboard using `beginStroke`, `drawStroke`, `endStroke`
- Online presence
- Quiz creation/taking
- Leaderboard
- Tutor profiles
- Appointment booking with overlap prevention
- Dashboard and responsive Bootstrap UI

## Deployment

### Backend — Render
1. Push this repository to GitHub.
2. Create a Render Web Service from the repository.
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - optional AWS variables
7. Deploy.
8. Verify `https://YOUR-BACKEND.onrender.com/api/health`.

### Frontend — Vercel or Netlify
1. Import the same GitHub repository.
2. Root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set:
```env
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api
VITE_SOCKET_URL=https://YOUR-BACKEND.onrender.com
```
6. Deploy.

### WebSockets
The backend uses Socket.io. The production host must support WebSockets. The frontend Socket.io URL must point to the deployed backend, not the frontend URL.

### AWS S3 production storage
For production:
- Create a private S3 bucket.
- Configure IAM credentials with least privilege.
- Upload files server-side.
- Store only object keys/metadata in MongoDB.
- Prefer signed URLs for downloads.
- Never expose AWS secret keys in React.

The included local upload mode is intended for development/demo. For a production deployment, wire the S3 adapter in `server/src/services/storage.js`.

## Demo checklist
Open the application in two browser windows:
1. Register/login two users.
2. Create/join the same group.
3. Enter the same study room.
4. Send chat messages from both windows.
5. Draw on the whiteboard in window A and watch it appear in window B.
6. Create a quiz and submit answers.
7. Open leaderboard.
8. Create tutor profile and test a booking.

## Important production notes
- Change `JWT_SECRET`.
- Use HTTPS.
- Restrict CORS to the deployed frontend.
- Use a private S3 bucket.
- Add rate limiting, validation, logging, monitoring and malware scanning for real production use.
- For horizontal scaling, use a Socket.io adapter such as Redis and appropriate load-balancer/WebSocket configuration.
- Do not upload `node_modules`, `.env`, or build caches to GitHub.

## Scripts
Server:
- `npm run dev` — development with nodemon
- `npm start` — production

Client:
- `npm run dev`
- `npm run build`
- `npm run preview`
