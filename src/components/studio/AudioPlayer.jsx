import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Download, Volume2, VolumeX } from "lucide-react";

import TrackChannel from "./TrackChannel";
import WaveformVisualizer from "./WaveformVisualizer";

const TRACK_TYPES = [
  { key: "vocals", name: "Vocals", color: "from-pink-500 to-rose-500", icon: "🎤" },
  { key: "drums", name: "Drums", color: "from-red-500 to-orange-500", icon: "🥁" },
  { key: "bass", name: "Bass", color: "from-purple-500 to-indigo-500", icon: "🎸" },
  { key: "guitar", name: "Guitar", color: "from-green-500 to-emerald-500", icon: "🎸" },
  { key: "other", name: "Other", color: "from-blue-500 to-cyan-500", icon: "🎵" }
];

export default function AudioPlayer({ project, onProjectUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [masterVolume, setMasterVolume] = useState([75]);
  
  // Initialize track volumes with default values for all 5 tracks
  const [trackVolumes, setTrackVolumes] = useState(() => {
    const initialVolumes = {};
    TRACK_TYPES.forEach(track => {
      initialVolumes[track.key] = 75;
    });
    return initialVolumes;
  });
  
  const [mutedTracks, setMutedTracks] = useState({});
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  
  // Audio context and sources
  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({});
  const audioSourcesRef = useRef({});
  const startTimeRef = useRef(0);
  const intervalRef = useRef(null);

  // Initialize audio context and load audio files
  useEffect(() => {
    const initAudio = async () => {
      try {
        setLoadingError(null);
        
        // Create audio context
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        
        const buffers = {};
        
        // Load audio files
        for (const track of TRACK_TYPES) {
          const trackUrl = project.separatedTracks[track.key];
          if (trackUrl) {
            try {
              const response = await fetch(`http://localhost:3001${trackUrl}`);
              const arrayBuffer = await response.arrayBuffer();
              const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
              buffers[track.key] = audioBuffer;
              
              // Set duration from first loaded track
              if (!duration) {
                setDuration(audioBuffer.duration);
              }
            } catch (error) {
              console.error(`Error loading ${track.key} audio:`, error);
              setLoadingError(`Failed to load ${track.key} audio`);
              return;
            }
          }
        }
        
        audioBuffersRef.current = buffers;
        setAudioLoaded(true);
        
      } catch (error) {
        console.error('Error initializing audio:', error);
        setLoadingError('Failed to initialize audio');
      }
    };
    
    initAudio();
    
    return () => {
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      clearInterval(intervalRef.current);
    };
  }, [project.separatedTracks]);

  // Handle play/pause
  useEffect(() => {
    if (!audioLoaded || !audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    
    if (isPlaying) {
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Start playback
      startTimeRef.current = audioContext.currentTime - currentTime;
      
      // Create sources for each track
      Object.entries(audioBuffersRef.current).forEach(([trackKey, buffer]) => {
        if (!mutedTracks[trackKey]) {
          const source = audioContext.createBufferSource();
          const gainNode = audioContext.createGain();
          
          source.buffer = buffer;
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Set volume
          const trackVolume = trackVolumes[trackKey] / 100;
          const masterVol = masterVolume[0] / 100;
          gainNode.gain.value = trackVolume * masterVol;
          
          // Start playback
          source.start(0, currentTime);
          audioSourcesRef.current[trackKey] = { source, gainNode };
        }
      });
      
      // Update time tracking
      intervalRef.current = setInterval(() => {
        const newTime = audioContext.currentTime - startTimeRef.current;
        setCurrentTime(newTime);
        
        // Stop if reached end
        if (newTime >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      }, 100);
      
    } else {
      // Stop all sources
      Object.values(audioSourcesRef.current).forEach(({ source }) => {
        try {
          source.stop();
        } catch (e) {
          // Source might already be stopped
        }
      });
      audioSourcesRef.current = {};
      clearInterval(intervalRef.current);
    }
    
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isPlaying, audioLoaded, mutedTracks, duration]);

  // Update volume
  useEffect(() => {
    if (!audioLoaded) return;
    
    Object.entries(audioSourcesRef.current).forEach(([trackKey, { gainNode }]) => {
      const trackVolume = mutedTracks[trackKey] ? 0 : trackVolumes[trackKey];
      const masterVol = masterVolume[0];
      gainNode.gain.value = (trackVolume / 100) * (masterVol / 100);
    });
  }, [trackVolumes, masterVolume, mutedTracks, audioLoaded]);

  const togglePlayback = () => {
    if (!audioLoaded) return;
    setIsPlaying(!isPlaying);
  };

  const handleTimeSeek = (value) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    
    if (isPlaying) {
      // Restart playback at new position
      setIsPlaying(false);
      setTimeout(() => {
        setCurrentTime(newTime);
        setIsPlaying(true);
      }, 50);
    }
  };

  const handleTrackVolumeChange = (trackKey, volume) => {
    setTrackVolumes(prev => ({ ...prev, [trackKey]: volume[0] }));
  };

  const toggleTrackMute = (trackKey) => {
    setMutedTracks(prev => ({ ...prev, [trackKey]: !prev[trackKey] }));
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadTrack = async (trackKey) => {
    const trackUrl = project.separatedTracks[trackKey];
    if (trackUrl) {
      const link = document.createElement('a');
      link.href = `http://localhost:3001${trackUrl}`;
      link.download = `${project.name}_${trackKey}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loadingError) {
    return (
      <Card className="glass-effect border-white/10">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <p className="text-lg font-semibold mb-2">Audio Loading Error</p>
            <p className="text-sm">{loadingError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Player Controls */}
      <Card className="glass-effect border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>{project.name}</span>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              {!audioLoaded && <span className="text-yellow-400">Loading...</span>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Waveform Visualizer */}
          <WaveformVisualizer 
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            trackVolumes={trackVolumes}
            mutedTracks={mutedTracks}
            audioLoaded={audioLoaded}
          />
          
          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              onValueChange={handleTimeSeek}
              max={duration || 100}
              step={0.1}
              className="w-full"
              disabled={!audioLoaded}
            />
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlayback}
                size="lg"
                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg neon-glow"
                disabled={!audioLoaded}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMasterVolume(masterVolume[0] > 0 ? [0] : [75])}
                  className="text-gray-400 hover:text-white"
                  disabled={!audioLoaded}
                >
                  {masterVolume[0] === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <Slider
                  value={masterVolume}
                  onValueChange={setMasterVolume}
                  max={100}
                  className="w-24"
                  disabled={!audioLoaded}
                />
              </div>
            </div>

            <div className="text-sm text-gray-400">
              Master Volume: {masterVolume[0]}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Track Controls */}
      <div className="grid gap-4">
        <h3 className="text-xl font-semibold text-white">Individual Tracks</h3>
        {TRACK_TYPES.map((track) => (
          <TrackChannel
            key={track.key}
            track={track}
            volume={trackVolumes[track.key]}
            isMuted={mutedTracks[track.key]}
            onVolumeChange={(volume) => handleTrackVolumeChange(track.key, volume)}
            onToggleMute={() => toggleTrackMute(track.key)}
            onDownload={() => downloadTrack(track.key)}
            isPlaying={isPlaying && !mutedTracks[track.key]}
            disabled={!audioLoaded}
          />
        ))}
      </div>
    </div>
  );
}