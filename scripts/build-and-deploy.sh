#!/bin/bash

# Build and deploy script for production
set -e

echo "🚀 Building frontend for production..."

# Go to project root
cd "$(dirname "$0")/.."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend to server/static directory
echo "🔨 Building frontend..."
npm run build:server

# Check if build was successful
if [ -d "server/static" ]; then
    echo "✅ Frontend built successfully to server/static"
    echo "📁 Static files:"
    ls -la server/static/
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Go to server directory
cd server

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Build completed successfully!"
echo ""
echo "📌 To start the production server, run:"
echo "   cd server && python run.py"
echo ""
echo "🌐 The application will be available at http://localhost:8000"
echo "   - Frontend: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/api/docs"