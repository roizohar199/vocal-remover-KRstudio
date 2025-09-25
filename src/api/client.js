const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Upload audio file
export const uploadAudio = async (file) => {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Separate audio
export const separateAudio = async (fileId, projectName) => {
  return apiCall('/separate', {
    method: 'POST',
    body: JSON.stringify({ fileId, projectName }),
  });
};

// Get separation progress
export const getSeparationProgress = async (fileId) => {
  return apiCall(`/separate/${fileId}/progress`);
};

// Get all projects
export const getProjects = async () => {
  return apiCall('/projects');
};

// Get specific project
export const getProject = async (id) => {
  return apiCall(`/projects/${id}`);
};

// Delete project
export const deleteProject = async (id) => {
  return apiCall(`/projects/${id}`, {
    method: 'DELETE',
  });
};

// Health check
export const healthCheck = async () => {
  return apiCall('/health');
};

// Project entity for compatibility with existing code
export class AudioProject {
  static async list(sortBy = '-createdAt') {
    const projects = await getProjects();
    // Sort projects by creation date (newest first)
    return projects.sort((a, b) => {
      const dateA = new Date(b.createdAt || b.created_date || 0);
      const dateB = new Date(a.createdAt || a.created_date || 0);
      return dateA - dateB;
    });
  }

  static async create(projectData) {
    // This will be handled by the separate endpoint
    throw new Error('Use separateAudio() instead of AudioProject.create()');
  }

  static async get(id) {
    return getProject(id);
  }

  static async delete(id) {
    return deleteProject(id);
  }
}

// Mock functions for compatibility (these will be replaced with real implementations)
export const UploadFile = async ({ file }) => {
  const result = await uploadAudio(file);
  return { file_url: result.file.id };
};

export const InvokeLLM = async (prompt) => {
  // Mock LLM response for now
  return { response: "This is a mock response. LLM functionality not implemented." };
}; 