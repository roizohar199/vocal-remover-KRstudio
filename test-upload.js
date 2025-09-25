// Simple test script to verify the upload and separation API
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testUpload() {
  try {
    console.log('🧪 Testing upload endpoint...');
    
    // Create a simple test file (1 second of silence)
    const testFile = Buffer.alloc(44100 * 2); // 1 second of 44.1kHz stereo
    fs.writeFileSync('test-audio.mp3', testFile);
    
    const formData = new FormData();
    formData.append('audio', fs.createReadStream('test-audio.mp3'), {
      filename: 'test-audio.mp3',
      contentType: 'audio/mpeg'
    });
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Upload successful:', result);
    
    // Clean up test file
    fs.unlinkSync('test-audio.mp3');
    
    return result.file.id;
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    throw error;
  }
}

async function testSeparation(fileId) {
  try {
    console.log('🧪 Testing separation endpoint...');
    
    const response = await fetch(`${API_BASE}/separate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileId: fileId,
        projectName: 'Test Project'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Separation failed: ${error.error}`);
    }
    
    const result = await response.json();
    console.log('✅ Separation started:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Separation test failed:', error.message);
    throw error;
  }
}

async function testProjects() {
  try {
    console.log('🧪 Testing projects endpoint...');
    
    const response = await fetch(`${API_BASE}/projects`);
    
    if (!response.ok) {
      throw new Error(`Projects fetch failed: ${response.status}`);
    }
    
    const projects = await response.json();
    console.log('✅ Projects retrieved:', projects.length, 'projects');
    
    return projects;
  } catch (error) {
    console.error('❌ Projects test failed:', error.message);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE}/health`);
    if (healthResponse.ok) {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed');
      return;
    }
    
    // Test upload
    const fileId = await testUpload();
    
    // Test separation
    await testSeparation(fileId);
    
    // Wait a moment for processing
    console.log('⏳ Waiting for processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test projects
    await testProjects();
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
runTests(); 