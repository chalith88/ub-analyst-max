# Use Node.js 18 with Debian base for better Playwright support
FROM node:18-bullseye

# Install system dependencies for Playwright and Canvas
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo-gobject2 \
    libcups2 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxss1 \
    libu2f-udev \
    libvulkan1 \
    xdg-utils \
    build-essential \
    libcairo2-dev \
    libgif-dev \
    libjpeg-dev \
    libpango1.0-dev \
    librsvg2-dev \
    libgbm1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files for backend
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy all source code including output directory
COPY . .

# Install frontend dependencies
WORKDIR /app/client
RUN npm install --legacy-peer-deps

# Build React frontend
RUN npm run build

# Go back to root
WORKDIR /app

# Install Playwright browsers
RUN npx playwright install chromium

# Go back to root
WORKDIR /app

# Expose port
EXPOSE $PORT

# Set environment variables for production
ENV NODE_ENV=production
ENV PLAYWRIGHT_HEADLESS=true

# Start the server with ts-node
CMD ["npx", "ts-node", "-T", "src/server.ts"]