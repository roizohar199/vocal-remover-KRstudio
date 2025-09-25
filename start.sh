#!/bin/bash

echo "🚀 Starting Audio Separation Studio..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first."
    echo "macOS: brew install ffmpeg"
    echo "Ubuntu/Debian: sudo apt install ffmpeg"
    echo "CentOS/RHEL: sudo yum install ffmpeg"
    exit 1
fi

echo "✅ All prerequisites are installed!"
echo "📦 Installing server dependencies..."
cd server
npm install

echo "🐍 Installing Demucs..."
npm run install-demucs

echo "🔧 Starting server..."
npm run dev &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

echo "🌐 Starting frontend..."
cd ..
npm install
npm run dev &
FRONTEND_PID=$!

echo "✅ Both server and frontend are starting..."
echo "📡 Server: http://localhost:3001"
echo "🎨 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $SERVER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait 