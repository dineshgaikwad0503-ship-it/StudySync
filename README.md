# StudySync — One Deployment Docker Edition

React + Bootstrap + Django REST + Node Socket.IO + MongoDB architecture.
The public application is served from ONE URL through Nginx.

## Local
docker compose up --build
Open http://localhost:8080

## Production
Push this repository to GitHub, create one Docker Web Service on Render,
expose port 8080, and configure MONGO_URI. The same URL serves React,
/api/* and /socket.io/*.


## Important Port Fix
Render PORT is used by Nginx on 8080. Socket.IO intentionally uses internal SOCKET_PORT=4000 so it does not collide with Nginx. Do not set SOCKET_PORT to 8080.
