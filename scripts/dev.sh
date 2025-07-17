#!/bin/bash

# Development script - starts frontend and backend separately
set -e

echo "🚀 Starting development environment..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}

trap cleanup EXIT INT TERM

# Go to project root
cd "$(dirname "$0")/.."

# Start backend
echo "🔧 Starting backend server..."
cd server
python run.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend dev server
echo "🎨 Starting frontend dev server..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Development environment started!"
echo ""
echo "📌 Services running at:"
echo "   - Frontend: http://localhost:8080"
echo "   - Backend API: http://localhost:8000/api"
echo "   - API Docs: http://localhost:8000/api/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for any process to exit
wait