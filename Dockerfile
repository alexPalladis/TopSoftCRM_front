# ============================================================
# Frontend Dockerfile — Multi-stage build
#
# Stage 1 (builder): builds the Vite/React app to static files
# Stage 2 (runtime): serves the static files with nginx
# ============================================================

# ── Stage 1: Build ───────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build
# VITE_API_URL is injected at build time via --build-arg
ARG VITE_API_URL=https://api.topsoft-crm.gr/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# ── Stage 2: Runtime (nginx) ─────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config (see nginx.conf in this repo)
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx runs as non-root (nginx:nginx user is already set up in the image)
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]