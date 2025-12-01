import React, { useState } from 'react';
import { Upload, Music, Play, Zap, Activity, Radio } from 'lucide-react';
import { Button } from './Button';

// Curated Sample Tracks
const SAMPLE_TRACKS = [
  {
    id: 'track1',
    title: 'Neon Horizon',
    artist: 'Cyber Dreams',
    difficulty: 'EASY',
    bpm: 110,
    color: 'from-emerald-400 to-cyan-500',
    icon: <Radio className="text-white" size={24} />,
    url: 'https://cdn.pixabay.com/audio/2021/11/01/audio_00fa5593f3.mp3' 
  },
  {
    id: 'track2',
    title: 'Night Runner',
    artist: 'Synthwave Boy',
    difficulty: 'MEDIUM',
    bpm: 130,
    color: 'from-blue-500 to-purple-600',
    icon: <Activity className="text-white" size={24} />,
    url: 'https://cdn.pixabay.com/audio/2022/03/24/audio_34b7f8c857.mp3' 
  },
  {
    id: 'track3',
    title: 'Velocity Max',
    artist: 'Hardcore Systems',
    difficulty: 'HARD',
    bpm: 160,
    color: 'from-rose-500 to-orange-500',
    icon: <Zap className="text-white" size={24} />,
    url: 'https://cdn.pixabay.com/audio/2022/04/27/audio_67bcf729cf.mp3'
  }
];

interface SongSelectorProps {
  onSongSelected: (file: File) => void;
  onTrackSelect: (url: string) => void;
  isLoading: boolean;
}

export const SongSelector: React.FC<SongSelectorProps> = ({ onSongSelected, onTrackSelect, isLoading }) => {
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
    <div className="flex flex-col items-center min-h-screen p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black w-full overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-12 py-10">
        
        {/* Header */}
        <div className="text-center animate-fade-in-down">
            <h1 className="text-5xl md:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)] mb-4">
            NEON BEAT
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide">
            Select a track to start the rhythm
            </p>
        </div>

        {/* Track List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_TRACKS.map((track, idx) => (
                <div 
                    key={track.id} 
                    className="group relative bg-slate-800/40 rounded-3xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/80 hover:-translate-y-2 flex flex-col overflow-hidden"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    {/* Background Glow */}
                    <div className={`absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br ${track.color} opacity-20 rounded-full blur-[60px] group-hover:opacity-30 transition-opacity duration-500`}></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${track.color} shadow-lg shadow-black/50 transform group-hover:scale-110 transition-transform duration-300`}>
                                {track.icon}
                            </div>
                            <div className={`px-3 py-1 rounded-full bg-slate-950/50 border border-slate-700/50 text-xs font-bold tracking-widest ${
                                track.difficulty === 'HARD' ? 'text-rose-400' : track.difficulty === 'MEDIUM' ? 'text-cyan-400' : 'text-emerald-400'
                            }`}>
                                {track.difficulty}
                            </div>
                        </div>
                        
                        <div className="mb-8 flex-grow">
                            <h3 className="text-2xl font-display font-bold text-white mb-1 group-hover:text-cyan-200 transition-colors">{track.title}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <Music size={14} />
                                <span>{track.artist}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                <span>{track.bpm} BPM</span>
                            </div>
                        </div>
                        
                        <Button 
                            className={`w-full ${track.difficulty === 'HARD' ? 'hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]' : 'hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'}`}
                            onClick={() => onTrackSelect(track.url)}
                            disabled={isLoading}
                            icon={isLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <Play size={18} fill="currentColor"/>}
                        >
                            {isLoading ? 'Loading...' : 'Play Track'}
                        </Button>
                    </div>
                </div>
            ))}
        </div>

        {/* Custom Upload Section */}
        <div className="flex flex-col items-center gap-6 mt-4">
             <div className="flex items-center gap-4 w-full opacity-50">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent flex-1"></div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Custom Zone</span>
                <div className="h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent flex-1"></div>
             </div>

             <div 
                className={`w-full max-w-2xl cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all duration-300 group
                    ${dragActive ? 'border-cyan-500 bg-cyan-900/10 scale-[1.02]' : 'border-slate-800 hover:border-slate-600 bg-slate-900/30 hover:bg-slate-900/60'}
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
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-slate-400 group-hover:text-slate-200">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                        <Upload size={28} className="text-cyan-500/70 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-bold text-white mb-1">Upload Custom Track</h4>
                        <p className="text-sm text-slate-500">Supports MP3, WAV, OGG files. Generated beatmaps may vary.</p>
                    </div>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};
