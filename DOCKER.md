# Running StudySync with Docker

## 1. Configure
```sh
cp .env.example .env      # edit JWT_SECRET (and S3 keys if you use S3)
```

## 2. Build & run
```sh
docker compose up --build
```
- Web app: http://localhost:8080
- API + Socket.io: http://localhost:5000 (health: /api/health)
- MongoDB: localhost:27017 (data persisted in the `mongo_data` volume)

## 3. Seed demo data
```sh
docker compose exec api node seed.js
```
Demo login: `alice@studysync.dev` / `password123` (group invite code `CALC1010`).

## Useful commands
```sh
docker compose logs -f api     # server logs
docker compose down            # stop
docker compose down -v         # stop + wipe DB and uploads
docker compose build --no-cache web
```

## Same-origin mode (no CORS)
nginx already proxies `/api`, `/uploads` and `/socket.io` to the API container.
To use it, set in `.env`:
```
VITE_API_URL=
CLIENT_ORIGIN=http://localhost:8080
```
then rebuild the web image. Everything then goes through http://localhost:8080.

## Notes
- Uploads without S3 land in the `uploads_data` volume mounted at `/app/uploads`.
- Socket.io scaling across multiple API replicas needs sticky sessions or a Redis adapter (`REDIS_URL`).
- Images: node:20-alpine (multi-stage, prod deps only) for the API, nginx:1.27-alpine for the client.
