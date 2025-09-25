import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <Card className="glass-effect border-white/10 max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Music className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">No Projects Yet</h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Upload your first MP3 file to get started with professional audio separation. 
            Transform your music into individual instrument tracks.
          </p>
          
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Upload className="w-5 h-5 mr-2" />
              Upload Your First Track
            </Button>
          </Link>
          
          <div className="mt-6 text-sm text-gray-500">
            Supported format: MP3
          </div>
        </CardContent>
      </Card>
    </div>
  );
}