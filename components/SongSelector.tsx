import React, { useState } from 'react';
import { Upload, Music, Music2 } from 'lucide-react';
import { Button } from './Button';

interface SongSelectorProps {
  onSongSelected: (file: File) => void;
  onDemoSelected: () => void;
  isLoading: boolean;
}

export const SongSelector: React.FC<SongSelectorProps> = ({ onSongSelected, onDemoSelected, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        onSongSelected(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onSongSelected(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black w-full overflow-hidden">
      
      <div className="text-center mb-12 animate-fade-in-down z-10">
        <h1 className="text-6xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)] mb-4">
          NEON BEAT
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
          Upload your music to generate a rhythm game
        </p>
      </div>

      <div className="w-full max-w-xl space-y-8 z-10">
        {/* Upload Area */}
        <div 
          className={`relative group cursor-pointer transition-all duration-300 border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-6
            ${dragActive ? 'border-cyan-400 bg-cyan-900/10 scale-105' : 'border-slate-700 bg-slate-800/30 hover:border-cyan-500/50 hover:bg-slate-800/50'}
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input 
            id="file-upload"
            type="file" 
            className="hidden" 
            accept="audio/*"
            onChange={handleChange}
          />
          
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-slate-700 transition-all duration-300 relative">
             {isLoading ? (
                 <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
             ) : (
                 <>
                  <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <Upload size={40} className="text-cyan-400 relative z-10" />
                 </>
             )}
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {isLoading ? 'Analyzing Rhythm...' : 'Select Audio File'}
            </h3>
            <p className="text-slate-500">
              Drag & drop MP3, WAV, OGG <br/> or click to browse
            </p>
          </div>
        </div>

        {/* Demo Option */}
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 w-full px-8">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-slate-600 text-xs uppercase tracking-widest">Quick Start</span>
                <div className="h-px bg-slate-800 flex-1"></div>
            </div>
            
            <Button 
                variant="secondary"
                onClick={onDemoSelected}
                disabled={isLoading}
                icon={<Music2 size={18} />}
                className="w-full"
            >
                Play Demo Track
            </Button>
        </div>
      </div>
      
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};
