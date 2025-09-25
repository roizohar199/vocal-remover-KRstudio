import React, { useState, useEffect } from "react";
import { AudioProject } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload, Music, Play, Pause, Download, Volume2 } from "lucide-react";

import ProjectCard from "../components/studio/ProjectCard";
import AudioPlayer from "../components/studio/AudioPlayer";
import EmptyState from "../components/studio/EmptyState";

export default function Studio() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await AudioProject.list('-createdAt');
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Studio</h1>
            <p className="text-gray-400 text-lg">Manage and mix your separated audio tracks</p>
          </div>
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Upload className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-effect rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-12 bg-gray-700 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Projects List */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-semibold text-white mb-4">Your Projects</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    onSelect={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            </div>

            {/* Audio Player */}
            <div className="lg:col-span-2">
              {selectedProject && (
                <AudioPlayer 
                  project={selectedProject}
                  onProjectUpdate={loadProjects}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}