import React, { useState, useRef, useEffect } from "react";
import { AudioProject } from "@/api/client";
import { uploadAudio, separateAudio, getSeparationProgress } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Music, ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

import UploadZone from "../components/upload/UploadZone";
import ProcessingStatus from "../components/upload/ProcessingStatus";

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === "audio/mpeg") {
      setFile(selectedFile);
      setProjectName(selectedFile.name.replace('.mp3', ''));
      setError("");
    } else {
      setError("Please select a valid MP3 file");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };



  const [currentFileId, setCurrentFileId] = useState(null);
  const [progressInterval, setProgressInterval] = useState(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  const processAudio = async () => {
    if (!file || !projectName.trim()) {
      setError("Please select a file and enter a project name");
      return;
    }

    setIsProcessing(true);
    setError("");
    setProgress(0);

    try {
      setProcessingStep("Uploading file...");
      setProgress(10);
      
      const uploadResult = await uploadAudio(file);
      const fileId = uploadResult.file.id;
      setCurrentFileId(fileId);
      
            setProgress(20);
      setProcessingStep("Starting audio separation...");
      
      // Start polling for progress updates immediately
      const interval = setInterval(async () => {
        try {
          const progressData = await getSeparationProgress(fileId);
          
          console.log('Progress data received:', progressData); // Debug log
          
          // Only update progress if we have valid data
          if (progressData && progressData.progress !== undefined) {
            setProgress(progressData.progress);
            setProcessingStep(progressData.message);
          }
          
          if (progressData.status === 'completed') {
            console.log('Separation completed, redirecting to studio...'); // Debug log
            clearInterval(interval);
            setProgressInterval(null);
            
            // Set progress to 100% and completion message
            setProgress(100);
            setProcessingStep('Separation completed!');
            
            setTimeout(() => {
              navigate(createPageUrl("Studio"));
            }, 1500);
          } else if (progressData.status === 'error') {
            console.log('Separation error:', progressData.message); // Debug log
            clearInterval(interval);
            setProgressInterval(null);
            setError(progressData.message);
            setIsProcessing(false);
            setProgress(0);
            setProcessingStep("");
          }
        } catch (error) {
          console.error('Progress polling error:', error);
        }
      }, 1000);
      
      setProgressInterval(interval);
      
      // Small delay to ensure progress polling is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Start audio separation (this will trigger the server to start processing)
      await separateAudio(fileId, projectName.trim());

    } catch (error) {
      console.error('Processing error:', error);
      setError("Failed to process audio file. Please try again.");
      setIsProcessing(false);
      setProgress(0);
      setProcessingStep("");
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ProcessingStatus 
          step={processingStep}
          progress={progress}
          projectName={projectName}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Studio"))}
            className="text-gray-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Upload Audio</h1>
            <p className="text-gray-400 text-lg">Separate your MP3 into individual instrument tracks</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Upload Zone */}
          <Card className="glass-effect border-white/10">
            <CardContent className="p-0">
              <UploadZone
                onDrop={handleDrop}
                onFileSelect={() => fileInputRef.current?.click()}
                hasFile={!!file}
                fileName={file?.name}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,audio/mpeg"
                onChange={handleFileInput}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Project Settings */}
          {file && (
            <Card className="glass-effect border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Name
                    </label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      placeholder="Enter project name..."
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      onClick={processAudio}
                      disabled={!file || !projectName.trim()}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Music className="w-5 h-5 mr-2" />
                      Start Audio Separation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}