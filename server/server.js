import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { PythonShell } from 'python-shell';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/separated', express.static('separated'));

// Create directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const separatedDir = path.join(__dirname, 'separated');
const projectsFile = path.join(__dirname, 'projects.json');

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(separatedDir);

// Initialize projects storage
let projects = [];
try {
  if (await fs.pathExists(projectsFile)) {
    projects = await fs.readJson(projectsFile);
  }
} catch (error) {
  console.log('No existing projects file, starting fresh');
}

// Save projects to file
const saveProjects = async () => {
  await fs.writeJson(projectsFile, projects, { spaces: 2 });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to avoid special characters
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${uuidv4()}-${sanitizedName}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Routes

// Upload audio file
app.post('/api/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      id: req.file.filename, // Use the filename as the ID
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Store progress for each separation job
const separationProgress = new Map();

// Separate audio using Demucs
app.post('/api/separate', async (req, res) => {
  try {
    const { fileId, projectName } = req.body;
    
    if (!fileId || !projectName) {
      return res.status(400).json({ error: 'File ID and project name are required' });
    }

    // Use the fileId directly as the filename
    const inputPath = path.join(uploadsDir, fileId);
    const outputDir = path.join(separatedDir, fileId);
    
    // Check if the file exists
    if (!await fs.pathExists(inputPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Create output directory
    await fs.ensureDir(outputDir);

    // Initialize progress tracking
    separationProgress.set(fileId, {
      status: 'processing',
      progress: 0,
      message: 'Initializing...',
      startTime: new Date()
    });

    // Demucs options for 4-stem separation
    const options = {
      mode: 'text',
      pythonPath: 'python3', // Use python3
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: __dirname,
      args: [
        inputPath,  // Input file path
        outputDir   // Output directory
      ]
    };

    // Start separation process
    const pyshell = new PythonShell('demucs_separate.py', options);

    pyshell.on('message', (message) => {
      console.log('Demucs output:', message);
      
      // Parse progress from Demucs output
      const progressMatch = message.match(/(\d+)%/);
      if (progressMatch) {
        const progress = parseInt(progressMatch[1]);
        const progressData = separationProgress.get(fileId);
        if (progressData) {
          // Scale progress from 0-100% to 10-90% (since we start at 10% and end at 90%)
          const scaledProgress = 10 + (progress * 0.8);
          progressData.progress = Math.round(scaledProgress);
          progressData.message = `Processing audio... ${progress}%`;
          separationProgress.set(fileId, progressData);
        }
      }
      
      // Check for model loading start
      if (message.includes('Selected model is a bag of')) {
        const progressData = separationProgress.get(fileId);
        if (progressData) {
          progressData.progress = 5;
          progressData.message = 'Loading AI model...';
          separationProgress.set(fileId, progressData);
        }
      }
      
      // Check for separation start
      if (message.includes('Separating track')) {
        const progressData = separationProgress.get(fileId);
        if (progressData) {
          progressData.progress = 10;
          progressData.message = 'Starting audio separation...';
          separationProgress.set(fileId, progressData);
        }
      }
    });

    pyshell.end(async (err) => {
      const progressData = separationProgress.get(fileId);
      
      if (err) {
        console.error('Demucs error:', err);
        if (progressData) {
          progressData.status = 'error';
          progressData.message = 'Audio separation failed';
          separationProgress.set(fileId, progressData);
        }
        return;
      }

      try {
        // Check if separation was successful - look in the nested htdemucs directory
        const htdemucsDir = path.join(outputDir, 'htdemucs');
        const modelDir = path.join(htdemucsDir, fileId.replace('.mp3', ''));
        
        // Check if the nested directories exist
        if (!await fs.pathExists(htdemucsDir)) {
          console.error('htdemucs directory not found');
          if (progressData) {
            progressData.status = 'error';
            progressData.message = 'Separation failed - no output directory';
            separationProgress.set(fileId, progressData);
          }
          return;
        }
        
        // Look for the model-specific directory
        const modelDirs = await fs.readdir(htdemucsDir);
        const actualModelDir = modelDirs.find(dir => dir.includes(fileId.replace('.mp3', '')));
        
        if (!actualModelDir) {
          console.error('Model directory not found');
          if (progressData) {
            progressData.status = 'error';
            progressData.message = 'Separation failed - model directory not found';
            separationProgress.set(fileId, progressData);
          }
          return;
        }
        
        const finalDir = path.join(htdemucsDir, actualModelDir);
        const separatedFiles = await fs.readdir(finalDir);
        
        // Check for 4-stem separation files
        const expectedTracks = ['vocals.mp3', 'drums.mp3', 'bass.mp3', 'other.mp3'];
        const missingTracks = expectedTracks.filter(track => !separatedFiles.includes(track));
        
        if (missingTracks.length > 0) {
          console.error('Missing tracks:', missingTracks);
          console.log('Available files:', separatedFiles);
          if (progressData) {
            progressData.status = 'error';
            progressData.message = `Missing tracks: ${missingTracks.join(', ')}`;
            separationProgress.set(fileId, progressData);
          }
          return;
        }

        console.log('Found all 4 separated tracks:', expectedTracks);

        // Extract real duration from the vocals track using FFmpeg
        let realDuration = 180; // fallback
        try {
          const vocalsPath = path.join(finalDir, 'vocals.mp3');
          const { stdout } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${vocalsPath}"`);
          realDuration = parseFloat(stdout.trim());
          console.log('Extracted duration:', realDuration, 'seconds');
        } catch (durationError) {
          console.warn('Could not extract duration, using fallback:', durationError.message);
        }

        // Create project record with correct paths for 4-stem separation
        const project = {
          id: uuidv4(),
          name: projectName,
          originalFile: fileId,
          originalFileId: fileId,
          separatedTracks: {
            vocals: `/separated/${fileId}/htdemucs/${actualModelDir}/vocals.mp3`,
            drums: `/separated/${fileId}/htdemucs/${actualModelDir}/drums.mp3`,
            bass: `/separated/${fileId}/htdemucs/${actualModelDir}/bass.mp3`,
            guitar: `/separated/${fileId}/htdemucs/${actualModelDir}/other.mp3`, // Use 'other' for guitar
            other: `/separated/${fileId}/htdemucs/${actualModelDir}/other.mp3`
          },
          status: 'completed',
          createdAt: new Date().toISOString(),
          duration: Math.round(realDuration)
        };

        projects.push(project);
        await saveProjects();
        
        // Update progress to completed
        if (progressData) {
          progressData.status = 'completed';
          progressData.progress = 100;
          progressData.message = 'Separation completed!';
          progressData.project = project;
          separationProgress.set(fileId, progressData);
          console.log('Progress updated to completed for fileId:', fileId); // Debug log
        }
        
        console.log('Project created successfully:', project.id);
      } catch (error) {
        console.error('Project creation error:', error);
        if (progressData) {
          progressData.status = 'error';
          progressData.message = 'Failed to create project';
          separationProgress.set(fileId, progressData);
        }
      }
    });

    // Send initial response
    res.json({
      success: true,
      message: 'Audio separation started',
      projectId: fileId
    });
    
    return; // Prevent further responses

  } catch (error) {
    console.error('Separation error:', error);
    res.status(500).json({ error: 'Audio separation failed' });
  }
});

// Get separation progress
app.get('/api/separate/:fileId/progress', (req, res) => {
  const { fileId } = req.params;
  const progress = separationProgress.get(fileId);
  
  console.log('Progress request for fileId:', fileId, 'Progress data:', progress); // Debug log
  
  if (!progress) {
    return res.status(404).json({ error: 'Progress not found' });
  }
  
  // Clean up completed or error states after some time
  if ((progress.status === 'completed' || progress.status === 'error') && 
      Date.now() - new Date(progress.startTime).getTime() > 300000) { // 5 minutes
    separationProgress.delete(fileId);
  }
  
  res.json(progress);
});

// Get all projects
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// Get specific project
app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projectIndex = projects.findIndex(p => p.id === req.params.id);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[projectIndex];
    
    // Remove files
    const separatedDir = path.join(__dirname, 'separated', project.originalFileId);
    const uploadFile = path.join(__dirname, 'uploads', project.originalFileId);
    
    try {
      await fs.remove(separatedDir);
      await fs.remove(uploadFile);
    } catch (fileError) {
      console.warn('Could not remove some files:', fileError);
    }

    // Remove from projects array
    projects.splice(projectIndex, 1);
    await saveProjects();

    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Audio separation server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`Separated files directory: ${separatedDir}`);
}); 