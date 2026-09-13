# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Server ---
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8010

# Install production dependencies for server only
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy compiled backend dist and frontend static assets
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8010

CMD ["node", "server/dist/index.js"]
