import React, { useEffect, useRef } from "react";

export default function WaveformVisualizer({ 
  isPlaying, 
  currentTime, 
  duration, 
  trackVolumes, 
  mutedTracks,
  audioLoaded
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const drawWaveform = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(103, 126, 234, 0.1)');
      gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (!audioLoaded || !duration) {
        // Show loading state
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading audio...', width / 2, height / 2);
        return;
      }

      // Generate more realistic waveform data
      const barWidth = 3;
      const barSpacing = 1;
      const totalBars = Math.floor(width / (barWidth + barSpacing));
      
      for (let i = 0; i < totalBars; i++) {
        const x = i * (barWidth + barSpacing);
        const progress = i / totalBars;
        const timePosition = progress * duration;
        
        // More realistic waveform generation
        let barHeight = 0;
        
        // Base waveform pattern
        const frequency = 0.05;
        const amplitude = 0.4;
        barHeight += Math.sin(i * frequency) * amplitude;
        
        // Add harmonics
        barHeight += Math.sin(i * frequency * 2) * amplitude * 0.5;
        barHeight += Math.sin(i * frequency * 3) * amplitude * 0.3;
        
        // Add some randomness for realism
        barHeight += (Math.random() - 0.5) * 0.2;
        
        // Scale to canvas height
        barHeight = Math.max(0.1, Math.abs(barHeight)) * height * 0.6;
        
        // Add dynamic movement when playing
        if (isPlaying) {
          // Add subtle animation based on current time
          const timeOffset = currentTime * 0.1;
          barHeight += Math.sin(i * 0.1 + timeOffset) * height * 0.05;
        }
        
        // Color based on current playback position and track activity
        const isPast = timePosition <= currentTime;
        const isActive = Math.abs(timePosition - currentTime) < (duration / totalBars);
        const isNearCurrent = Math.abs(timePosition - currentTime) < (duration / totalBars) * 3;
        
        let color;
        if (isActive && isPlaying) {
          color = 'rgba(0, 212, 255, 0.9)';
        } else if (isNearCurrent && isPlaying) {
          color = 'rgba(103, 126, 234, 0.8)';
        } else if (isPast) {
          color = 'rgba(103, 126, 234, 0.6)';
        } else {
          color = 'rgba(255, 255, 255, 0.2)';
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      }

      // Progress line
      if (duration > 0) {
        const progressX = (currentTime / duration) * width;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, height);
        ctx.stroke();
        
        // Add a glow effect to the progress line when playing
        if (isPlaying) {
          ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
    };

    const animate = () => {
      drawWaveform();
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    drawWaveform();
    if (isPlaying) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, trackVolumes, mutedTracks, audioLoaded]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full h-32 rounded-lg bg-black/20"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Audio status indicator */}
      {audioLoaded && (
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        </div>
      )}
    </div>
  );
}