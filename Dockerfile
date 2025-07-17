# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Build frontend to server/static
RUN npm run build:server

# Final stage for Python backend
FROM python:3.12.9-bullseye

WORKDIR /app

# Copy Python requirements and install dependencies
COPY server/requirements.txt ./requirements.txt
RUN pip3 install -r requirements.txt 

# Copy server code
COPY server/ .

# Copy built frontend from the build stage
COPY --from=frontend-builder /app/server/static ./static

CMD ["python3", "run.py"]
