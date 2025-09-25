# Audio Separation Studio

A modern web application for separating audio tracks using AI-powered Demucs technology. This application allows you to upload audio files and separate them into 4 individual instrument tracks (vocals, drums, bass, other) with a beautiful, intuitive interface. The "other" track contains guitar and additional instruments.

## Features

- 🎵 **Audio Upload**: Support for MP3, WAV, and other audio formats
- 🧠 **AI Separation**: Powered by Demucs for high-quality 4-stem separation
- 🎤 **4 Individual Tracks**: Separate into vocals, drums, bass, and other (containing guitar and additional instruments)
- 🎚️ **Multi-track Playback**: Individual track controls with volume and mute
- 📁 **Project Management**: Organize and manage your separated tracks
- 🎨 **Modern UI**: Beautiful dark theme with glass morphism effects
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js
- **Audio Separation**: Demucs (Python)
- **File Handling**: Multer, fs-extra
- **Real-time Updates**: WebSocket-like polling

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python 3.7+** - [Download here](https://www.python.org/downloads/)
- **pip** (Python package manager) - Usually comes with Python
- **FFmpeg** - Required for audio processing - [Download here](https://ffmpeg.org/download.html)

### Windows-Specific Requirements

- **Windows 10/11** (64-bit recommended)
- **Git Bash** or **Windows Subsystem for Linux (WSL)** for better compatibility
- **Visual Studio Build Tools** (if you encounter compilation errors)
- **FFmpeg for Windows** - Download from [FFmpeg Windows builds](https://github.com/BtbN/FFmpeg-Builds/releases) or install via [Chocolatey](https://chocolatey.org/): `choco install ffmpeg`

## Quick Start

### Option 1: Automated Setup (Recommended)

#### On macOS/Linux:
```bash
./start.sh
```

#### On Windows:
```cmd
start.bat
```

**Windows Notes:**
- The script will automatically check for Node.js and Python
- **FFmpeg must be installed and added to PATH** before running the script
- Two command prompt windows will open (one for server, one for frontend)
- Keep both windows open while using the application
- The script will install all dependencies automatically

### Option 2: Manual Setup

1. **Clone or download the project**

2. **Install FFmpeg:**
   - **Windows**: Download from [FFmpeg Windows builds](https://github.com/BtbN/FFmpeg-Builds/releases) or install via Chocolatey: `choco install ffmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Ubuntu/Debian**: `sudo apt install ffmpeg`
   - **CentOS/RHEL**: `sudo yum install ffmpeg`

3. **Install frontend dependencies:**
   ```bash
   npm install
   ```

4. **Setup the backend server:**
   ```bash
   cd server
   npm install
   npm run install-demucs
   ```

5. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```

6. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Usage

1. **Upload Audio**: Navigate to the Upload page and select an audio file
2. **Name Your Project**: Enter a descriptive name for your project
3. **Wait for Processing**: The AI will separate your audio into 4 individual tracks (vocals, drums, bass, other)
4. **Enjoy Your Tracks**: Use the Studio to play, mix, and download your separated tracks

## API Endpoints

The backend provides the following REST API endpoints:

- `POST /api/upload` - Upload audio files
- `POST /api/separate` - Separate audio tracks using Demucs
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get specific project details
- `DELETE /api/projects/:id` - Delete a project and its files
- `GET /api/health` - Health check endpoint

## Project Structure

```
stem-split-1047be35/
├── src/                    # Frontend React application
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── api/               # API client functions
│   └── ...
├── server/                # Backend Node.js server
│   ├── server.js          # Main server file
│   ├── demucs_separate.py # Demucs integration
│   ├── uploads/           # Uploaded audio files
│   ├── separated/         # Separated audio tracks
│   └── projects.json      # Project metadata
├── start.sh               # Unix/macOS startup script
├── start.bat              # Windows startup script
└── README.md              # This file
```

## Configuration

### Environment Variables

- `PORT` - Backend server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

### File Limits

- Maximum file size: 100MB
- Supported formats: MP3, WAV, FLAC, M4A, etc.
- Output format: MP3 (320kbps)

## Troubleshooting

### Common Issues

1. **"Demucs not found" error:**
   ```bash
   cd server
   pip install demucs
   ```

2. **Port already in use:**
   - Change the PORT environment variable
   - Or kill the process using the port

3. **Python not found:**
   - Make sure Python 3 is installed and in your PATH
   - Try using `python3` instead of `python`

4. **CORS errors:**
   - The server is configured to accept requests from any origin in development
   - For production, configure CORS appropriately

### Windows-Specific Issues

1. **"python is not recognized" error:**
   - Make sure Python is added to your system PATH
   - Try running `python --version` in a new command prompt
   - Reinstall Python and check "Add Python to PATH" during installation

2. **"node is not recognized" error:**
   - Make sure Node.js is added to your system PATH
   - Try running `node --version` in a new command prompt
   - Reinstall Node.js and ensure it's added to PATH

3. **"ffmpeg is not recognized" error:**
   - Download FFmpeg from [FFmpeg Windows builds](https://github.com/BtbN/FFmpeg-Builds/releases)
   - Extract to a folder (e.g., `C:\ffmpeg`)
   - Add the `bin` folder to your system PATH
   - Or install via Chocolatey: `choco install ffmpeg`
   - Restart command prompt after adding to PATH

4. **Permission errors:**
   - Run Command Prompt as Administrator
   - Or use Git Bash for better Unix-like environment

5. **Slow performance:**
   - Close unnecessary applications
   - Ensure sufficient RAM (8GB+ recommended)
   - Use SSD storage for better I/O performance

6. **Command prompt windows closing immediately:**
   - The start.bat script opens separate windows for server and frontend
   - Keep both windows open while using the application
   - If windows close, check the error messages and restart

### Performance Tips

- Use shorter audio files for faster processing
- Close other applications to free up system resources
- Ensure you have sufficient disk space for temporary files
- **Windows**: Use SSD storage and ensure adequate RAM (8GB+ recommended)

## Development

### Running in Development Mode

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Demucs](https://github.com/facebookresearch/demucs) - Audio separation technology
- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Radix UI](https://www.radix-ui.com/) - UI components

## Support

If you encounter any issues or have questions, please:

1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with detailed information

---

**Note**: This application requires significant computational resources for audio separation. Processing time depends on your hardware and the length of the audio file. For optimal performance on Windows, ensure you have at least 8GB RAM and use an SSD for storage.
