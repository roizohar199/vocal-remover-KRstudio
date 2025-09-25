@echo off
echo 🚀 Starting Audio Separation Studio...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if FFmpeg is installed
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo ❌ FFmpeg is not installed or not in PATH. Please install FFmpeg first.
    echo Download from: https://github.com/BtbN/FFmpeg-Builds/releases
    echo Or install via Chocolatey: choco install ffmpeg
    pause
    exit /b 1
)

echo ✅ All prerequisites are installed!
echo 📦 Installing server dependencies...
cd server
call npm install

echo 🐍 Installing Demucs...
call npm run install-demucs

echo 🔧 Starting server...
start "Audio Separation Server" cmd /k "npm run dev"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

echo 🌐 Starting frontend...
cd ..
call npm install
start "Audio Separation Frontend" cmd /k "npm run dev"

echo ✅ Both server and frontend are starting...
echo 📡 Server: http://localhost:3001
echo 🎨 Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul 