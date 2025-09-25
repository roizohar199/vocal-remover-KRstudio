import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Download, Play, Pause } from "lucide-react";

export default function TrackChannel({ 
  track, 
  volume, 
  isMuted, 
  onVolumeChange, 
  onToggleMute, 
  onDownload,
  isPlaying,
  disabled = false
}) {
  // Ensure volume is a valid number, default to 75 if undefined
  const displayVolume = typeof volume === 'number' ? volume : 75;
  const isMutedState = Boolean(isMuted);

  return (
    <Card className={`glass-effect border-white/10 track-glow bg-gradient-to-r ${track.color} bg-opacity-5`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${track.color} flex items-center justify-center text-2xl shadow-lg`}>
              {track.icon}
            </div>
            
            <div>
              <h4 className="font-semibold text-white">{track.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                {isPlaying && !isMutedState && !disabled && (
                  <div className="flex gap-1 h-4 items-end">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 bg-gradient-to-r ${track.color} rounded-full audio-wave`}
                        style={{
                          height: `${8 + (i * 2)}px`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '0.6s'
                        }}
                      />
                    ))}
                  </div>
                )}
                <span className="text-xs text-gray-400 min-w-[60px]">
                  {disabled ? 'Loading...' : (isMutedState ? 'Muted' : `${displayVolume}%`)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMute}
                className="text-gray-400 hover:text-white"
                disabled={disabled}
              >
                {isMutedState ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[isMutedState ? 0 : displayVolume]}
                onValueChange={onVolumeChange}
                max={100}
                className="w-24"
                disabled={isMutedState || disabled}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              disabled={disabled}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}