# Architecture

Browser → React/Vite → Express REST API → MongoDB
                         ↘ Socket.io ↔ all room clients
                         ↘ Storage adapter → local/S3
                         ↘ JWT authentication

Socket events:
- joinRoom
- leaveRoom
- chatMessage
- beginStroke
- drawStroke
- endStroke
- clearBoard
- presence

Whiteboard strategy:
Each stroke is broadcast as compact points. The server does not persist every mousemove in MongoDB. For production persistence, periodically save stroke snapshots or use a collaborative document model.
