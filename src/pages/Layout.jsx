
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Music, Upload, Settings, Mic2 } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <style>
        {`
          :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --accent-blue: #00d4ff;
            --accent-purple: #b794f6;
            --accent-green: #68d391;
            --studio-dark: #1a1a1a;
            --studio-darker: #0f0f0f;
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .neon-glow {
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          }
          
          .audio-wave {
            background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple), var(--accent-green));
            background-size: 200% 200%;
            animation: wave-flow 3s ease-in-out infinite;
          }
          
          @keyframes wave-flow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          .track-glow {
            transition: all 0.3s ease;
          }
          
          .track-glow:hover {
            box-shadow: 0 8px 32px rgba(103, 126, 234, 0.4);
            transform: translateY(-2px);
          }
        `}
      </style>
      
      {/* Navigation Header */}
      <nav className="glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Music className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">StemSplit</h1>
                <p className="text-sm text-gray-400">Professional Audio Separator</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link 
                to={createPageUrl("Studio")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === createPageUrl("Studio") 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Mic2 className="w-5 h-5" />
                <span className="font-medium">Studio</span>
              </Link>
              
              <Link 
                to={createPageUrl("Upload")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === createPageUrl("Upload") 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Upload</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
      
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
