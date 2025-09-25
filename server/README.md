# Audio Separation Server

A Node.js server that provides audio separation capabilities using Demucs.

## Features

- Upload audio files (MP3, WAV, etc.)
- Separate audio into 5 individual tracks using Demucs:
  - 🎤 Vocals
  - 🥁 Drums  
  - 🎸 Bass
  - 🎸 Guitar
  - 🎵 Other
- Project management (create, list, delete)
- File serving for separated tracks
- RESTful API

## Prerequisites

- Node.js (v16 or higher)
- Python 3.7 or higher
- pip (Python package manager)

## Installation

1. Install Node.js dependencies:
```bash
npm install
```

2. Install Demucs (Python package):
```bash
npm run install-demucs
```

Or manually:
```bash
pip install demucs
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on port 3001 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### Upload Audio File
```
POST /api/upload
Content-Type: multipart/form-data

Form data:
- audio: Audio file
```

### Separate Audio
```
POST /api/separate
Content-Type: application/json

{
  "fileId": "file-id-from-upload",
  "projectName": "My Project"
}
```

### Get All Projects
```
GET /api/projects
```

### Get Specific Project
```
GET /api/projects/:id
```

### Delete Project
```
DELETE /api/projects/:id
```

### Health Check
```
GET /api/health
```

## File Structure

```
server/
├── uploads/          # Uploaded audio files
├── separated/        # Separated audio tracks
├── projects.json     # Project metadata
├── server.js         # Main server file
├── demucs_separate.py # Demucs integration script
└── package.json
```

## Configuration

The server creates the following directories automatically:
- `uploads/` - for storing uploaded audio files
- `separated/` - for storing separated tracks
- `projects.json` - for storing project metadata

## CORS

The server is configured to accept requests from any origin for development. In production, you should configure CORS appropriately.

## Error Handling

The server includes comprehensive error handling for:
- File upload errors
- Audio separation failures
- Missing files
- Invalid requests

## Security Notes

- File size is limited to 100MB
- Only audio files are accepted
- Files are stored with unique names to prevent conflicts
- Consider implementing authentication for production use 