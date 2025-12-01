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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black w-full max-w-4xl mx-auto">
      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-6xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)] mb-4">
          NEON BEAT
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
          Generate rhythm games from your own music library
        </p>
      </div>

      <div className="w-full max-w-lg space-y-8">
        {/* Upload Area */}
        <div 
          className={`relative group cursor-pointer transition-all duration-300 border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4
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
          
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
             {isLoading ? (
                 <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
             ) : (
                 <Upload size={32} className="text-cyan-400" />
             )}
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                {isLoading ? 'Analyzing Rhythm...' : 'Upload Music File'}
            </h3>
            <p className="text-sm text-slate-500">
              Drag & drop or click to browse <br/> MP3, WAV, OGG supported
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 text-sm uppercase tracking-wider">OR</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        {/* Demo Button */}
        <Button 
            className="w-full py-4 text-lg" 
            variant="secondary"
            onClick={onDemoSelected}
            disabled={isLoading}
            icon={<Music2 />}
        >
            Try Demo Track
        </Button>
      </div>
      
      {/* Footer */}
      <div className="mt-16 text-center text-slate-600 text-xs uppercase tracking-widest">
         Use Keys <span className="text-cyan-500 font-bold mx-1">D F J K</span> or Touch Screen
      </div>
    </div>
  );
};
