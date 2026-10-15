# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency manifests and install packages
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the app using Caddy
FROM caddy:alpine
WORKDIR /app
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv