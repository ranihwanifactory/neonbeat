import React from 'react';
import { ScoreState } from '../types';
import { Button } from './Button';
import { RotateCcw, Home } from 'lucide-react';

interface ResultsProps {
  score: ScoreState;
  onRetry: () => void;
  onMenu: () => void;
}

export const Results: React.FC<ResultsProps> = ({ score, onRetry, onMenu }) => {
  // Calculate Rank
  const totalNotes = score.perfect + score.good + score.miss;
  const accuracy = totalNotes > 0 ? ((score.perfect * 1 + score.good * 0.5) / totalNotes) * 100 : 0;
  
  let rank = 'F';
  let rankColor = 'text-gray-500';
  if (accuracy >= 95) { rank = 'S'; rankColor = 'text-yellow-400'; }
  else if (accuracy >= 90) { rank = 'A'; rankColor = 'text-green-400'; }
  else if (accuracy >= 80) { rank = 'B'; rankColor = 'text-cyan-400'; }
  else if (accuracy >= 70) { rank = 'C'; rankColor = 'text-blue-400'; }
  else if (accuracy >= 60) { rank = 'D'; rankColor = 'text-purple-400'; }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-900 text-white animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-800/50 p-8 md:p-12 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 ${rank === 'S' || rank === 'A' ? 'bg-yellow-500/20' : 'bg-cyan-500/20'} rounded-full blur-[80px] pointer-events-none`}></div>

        <h2 className="text-3xl font-display font-bold text-center mb-8 uppercase tracking-widest text-slate-300">Track Complete</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12">
           {/* Rank */}
           <div className="flex flex-col items-center">
              <div className={`text-[12rem] leading-none font-black font-display ${rankColor} drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]`}>
                {rank}
              </div>
              <div className="text-xl font-display text-slate-400">{accuracy.toFixed(1)}% Accuracy</div>
           </div>

           {/* Stats */}
           <div className="flex flex-col gap-4 w-full md:w-auto">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 flex justify-between items-center min-w-[200px]">
                 <span className="text-slate-400 font-bold">SCORE</span>
                 <span className="text-2xl font-display text-white">{score.score.toLocaleString()}</span>
              </div>
              
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                 <span className="text-slate-400 font-bold">MAX COMBO</span>
                 <span className="text-2xl font-display text-yellow-400">{score.maxCombo}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                 <div className="text-center">
                    <div className="text-xs text-green-500 font-bold">PERFECT</div>
                    <div className="text-xl font-bold">{score.perfect}</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-blue-500 font-bold">GOOD</div>
                    <div className="text-xl font-bold">{score.good}</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xs text-rose-500 font-bold">MISS</div>
                    <div className="text-xl font-bold">{score.miss}</div>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex gap-4 justify-center">
            <Button onClick={onRetry} variant="primary" icon={<RotateCcw size={20}/>}>Replay</Button>
            <Button onClick={onMenu} variant="secondary" icon={<Home size={20}/>}>New Song</Button>
        </div>

      </div>
    </div>
  );
};
