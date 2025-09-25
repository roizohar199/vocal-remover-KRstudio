import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function ProjectCard({ project, isSelected, onSelect }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "error": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <Card 
      className={`glass-effect border-white/10 cursor-pointer track-glow transition-all duration-300 ${
        isSelected ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : 'hover:bg-white/5'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white text-sm">{project.name}</h3>
          </div>
        </div>
        
        <div className="space-y-2">
          <Badge className={`text-xs ${getStatusColor(project.status || project.processing_status)}`}>
            {(project.status || project.processing_status) === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
            {project.status || project.processing_status}
          </Badge>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {(() => {
              try {
                const date = project.createdAt || project.created_date;
                return date ? format(new Date(date), "MMM d, yyyy") : "Unknown date";
              } catch (error) {
                return "Invalid date";
              }
            })()}
          </div>
          
          {project.duration && (
            <div className="text-xs text-gray-400">
              Duration: {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}