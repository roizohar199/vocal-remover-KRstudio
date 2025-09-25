import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Music, Loader2 } from "lucide-react";

export default function ProcessingStatus({ step, progress, projectName }) {
  // Extract the actual percentage from the step message if it contains one
  const getActualProgress = () => {
    const progressMatch = step.match(/(\d+)%/);
    if (progressMatch) {
      return parseInt(progressMatch[1]);
    }
    // If no percentage in message, check if it's a completion message
    if (step.toLowerCase().includes('completed') || step.toLowerCase().includes('finished')) {
      return 100;
    }
    // Fallback to the progress value, but ensure it's reasonable
    const fallbackProgress = Math.round(progress);
    return Math.min(100, Math.max(0, fallbackProgress));
  };

  const actualProgress = getActualProgress();
  
  // Always use the actual progress for both the progress bar and display
  // This ensures consistency since both values come from the same source (the message)
  const progressBarValue = actualProgress;

  return (
    <Card className="glass-effect border-white/10 max-w-lg mx-auto">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative">
            <Music className="w-10 h-10 text-white" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Audio</h2>
            <p className="text-gray-400">{projectName}</p>
          </div>
          
          <div className="space-y-3">
            <Progress value={progressBarValue} className="w-full h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {step}
              </span>
              <span className="text-white font-medium">{actualProgress}%</span>
            </div>
          </div>
          
          <div className="bg-blue-500/10 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-300">
              <strong className="text-white">AI Separation in Progress:</strong><br />
              Your audio is being analyzed and separated into individual instrument tracks using advanced machine learning algorithms.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}