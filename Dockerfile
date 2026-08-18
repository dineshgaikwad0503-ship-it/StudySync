FROM node:22-bookworm-slim AS frontend
WORKDIR /build
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

FROM python:3.12-slim AS py
WORKDIR /build
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM node:22-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y nginx supervisor && rm -rf /var/lib/apt/lists/*
COPY --from=py /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=py /usr/local/bin/gunicorn /usr/local/bin/gunicorn
COPY --from=frontend /build/dist /app/frontend/dist
COPY backend /app/backend
COPY socket /app/socket
COPY nginx/studysync.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
WORKDIR /app/socket
RUN npm install
WORKDIR /app
EXPOSE 8080
CMD ["/usr/bin/supervisord","-c","/etc/supervisor/conf.d/supervisord.conf"]
