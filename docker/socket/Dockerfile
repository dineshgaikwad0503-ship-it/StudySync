FROM node:22-alpine
WORKDIR /app
COPY socket/package*.json ./
RUN npm install
COPY socket .
EXPOSE 4000
CMD ["npm","start"]
