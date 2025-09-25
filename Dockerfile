# Audio Separation App with Demucs
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    ffmpeg \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies with --break-system-packages flag
RUN pip3 install --no-cache-dir --break-system-packages \
    demucs \
    torch \
    torchaudio \
    numpy \
    scipy

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY server/package*.json ./server/

# Install Node.js dependencies
RUN npm ci --only=production
RUN cd server && npm ci --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads separated server/uploads server/separated

# Build the frontend
RUN npm run build

# Set permissions
RUN chmod +x server/demucs_separate.py

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "server/server.js"]
