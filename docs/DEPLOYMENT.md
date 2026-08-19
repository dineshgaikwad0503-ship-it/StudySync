# Deployment Handbook

## GitHub
```bash
git init
git add .
git commit -m "Initial StudySync"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/studysync.git
git push -u origin main
```

## Render backend
Root: `server`
Build: `npm install`
Start: `npm start`

Required:
MONGODB_URI, JWT_SECRET, CLIENT_URL

## Vercel frontend
Root: `client`
Build: `npm run build`
Output: `dist`

Required:
VITE_API_URL, VITE_SOCKET_URL

## MongoDB Atlas
Use the SRV URL:
`mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/studysync`

If password contains reserved URL characters, URL-encode it.

## WebSocket troubleshooting
- Check browser Network/WebSocket tab.
- Confirm `VITE_SOCKET_URL`.
- Confirm backend CORS `CLIENT_URL`.
- Confirm hosting provider permits WebSockets.
- Avoid opening the frontend URL as the Socket.io endpoint.

## Security
Never commit:
- JWT secrets
- MongoDB passwords
- AWS access keys
- API keys
