#!/bin/bash
# CodeEngage Development Server

echo "🚀 Starting CodeEngage Development Environment..."

# Function to kill processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT

# Start Backend
echo "Starting Backend on http://localhost:8000..."
/usr/local/bin/php -S localhost:8000 -t codeengage-backend/public &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 1

# Start Frontend
echo "Starting Frontend on http://localhost:3000..."
cd codeengage-frontend
npm run start &
FRONTEND_PID=$!

# Keep script running
wait
