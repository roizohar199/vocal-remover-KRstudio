import React, { useState } from "react";
import { Upload, Music, FileAudio, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadZone({ onDrop, onFileSelect, hasFile, fileName }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    onDrop(e);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
        isDragging 
          ? 'border-blue-400 bg-blue-500/10' 
          : hasFile 
            ? 'border-green-400 bg-green-500/10' 
            : 'border-white/20 hover:border-white/30'
      }`}
    >
      <div className="text-center">
        {hasFile ? (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">File Selected</h3>
              <p className="text-green-400 font-medium">{fileName}</p>
              <p className="text-gray-400 text-sm mt-2">Ready for processing</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              {isDragging ? (
                <Music className="w-10 h-10 text-white animate-bounce" />
              ) : (
                <FileAudio className="w-10 h-10 text-white" />
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {isDragging ? 'Drop your MP3 file here' : 'Upload MP3 File'}
              </h3>
              <p className="text-gray-400 mb-6">
                Drag and drop your audio file or click to browse
              </p>
            </div>
            
            <Button
              onClick={onFileSelect}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3 rounded-xl"
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose MP3 File
            </Button>
            
            <p className="text-xs text-gray-500 mt-4">
              Supported format: MP3 • Max file size: 50MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}