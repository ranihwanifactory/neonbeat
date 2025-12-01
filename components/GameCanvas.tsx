import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Note, ScoreState, LANE_COLORS, LANE_KEYS, GameState } from '../types';
import { Play, RotateCcw, Menu as MenuIcon, Pause } from 'lucide-react';
import { Button } from './Button';

interface GameCanvasProps {
  audioBuffer: AudioBuffer;
  notes: Note[];
  onGameEnd: (score: ScoreState) => void;
  onExit: () => void;
}

// Configuration
const NOTE_SPEED = 600; // Pixels per second
const HIT_Y_OFFSET = 100; // Distance from bottom where hit line is
const HIT_WINDOW_PERFECT = 0.050; // +/- 50ms
const HIT_WINDOW_GOOD = 0.120; // +/- 120ms
const LOOKAHEAD_TIME = 2.0; // How many seconds ahead to spawn/render notes

export const GameCanvas: React.FC<GameCanvasProps> = ({ audioBuffer, notes, onGameEnd, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [scoreState, setScoreState] = useState<ScoreState>({
    perfect: 0,
    good: 0,
    miss: 0,
    combo: 0,
    maxCombo: 0,
    score: 0
  });

  // Mutable refs for high-frequency updates to avoid React render lag
  const notesRef = useRef<Note[]>(JSON.parse(JSON.stringify(notes))); // Deep copy
  const activeNotesRef = useRef<Note[]>([]);
  const lastNoteIndexRef = useRef<number>(0);
  const keyState = useRef<boolean[]>([false, false, false, false]);
  const laneEffects = useRef<number[]>([0, 0, 0, 0]); // Opacity of hit effect per lane

  // Setup Audio
  useEffect(() => {
    const initAudio = async () => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      await playAudio(0);
    };

    initAudio();

    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playAudio = async (offset: number) => {
    if (!audioContextRef.current) return;
    
    // Create new source
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start(0, offset);
    sourceNodeRef.current = source;
    
    // Reset start time relative to current context time
    startTimeRef.current = audioContextRef.current.currentTime - offset;
    
    source.onended = () => {
       // Only trigger game end if we played to the end and weren't paused
       // We'll handle "End" via time check in loop mostly, but this is a fallback
    };
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
  };

  const handlePause = () => {
    if (gameState === GameState.PLAYING) {
      if (audioContextRef.current) {
         // Calculate current track time
         pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
         stopAudio();
         setGameState(GameState.PAUSED);
      }
    } else if (gameState === GameState.PAUSED) {
      playAudio(pauseTimeRef.current);
      setGameState(GameState.PLAYING);
    }
  };

  // Input Handling
  const handleInput = useCallback((laneIndex: number) => {
    if (gameState !== GameState.PLAYING || !audioContextRef.current) return;

    const currentTime = audioContextRef.current.currentTime - startTimeRef.current;
    
    // Find closest note in this lane
    // We iterate active notes. Since they are sorted by time, we find the first one that hasn't been hit.
    const hitNote = activeNotesRef.current.find(n => n.lane === laneIndex && !n.hit && !n.missed);

    if (hitNote) {
      const timeDiff = Math.abs(currentTime - hitNote.time);
      
      if (timeDiff <= HIT_WINDOW_GOOD) {
        hitNote.hit = true;
        
        let points = 0;
        let type: 'perfect' | 'good' = 'good';

        if (timeDiff <= HIT_WINDOW_PERFECT) {
          points = 100;
          type = 'perfect';
        } else {
          points = 50;
          type = 'good';
        }

        // Trigger visual effect
        laneEffects.current[laneIndex] = 1.0;

        setScoreState(prev => {
          const newCombo = prev.combo + 1;
          return {
            ...prev,
            [type]: prev[type] + 1,
            combo: newCombo,
            maxCombo: Math.max(prev.maxCombo, newCombo),
            score: prev.score + points * Math.min(newCombo > 10 ? 2 : 1, 4) // Multiplier logic
          };
        });
      }
    }
  }, [gameState]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const keyIndex = LANE_KEYS.indexOf(e.key.toUpperCase());
      if (keyIndex !== -1) {
        keyState.current[keyIndex] = true;
        handleInput(keyIndex);
      }
      if (e.key === 'Escape') {
        handlePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyIndex = LANE_KEYS.indexOf(e.key.toUpperCase());
      if (keyIndex !== -1) {
        keyState.current[keyIndex] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInput, handlePause]);


  // Game Loop
  const render = useCallback(() => {
    if (!canvasRef.current || !containerRef.current || !audioContextRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match container
    if (canvas.width !== containerRef.current.clientWidth || canvas.height !== containerRef.current.clientHeight) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    }

    const width = canvas.width;
    const height = canvas.height;
    const laneWidth = width / 4;
    const hitY = height - HIT_Y_OFFSET;

    // --- LOGIC UPDATE ---
    if (gameState === GameState.PLAYING) {
      const currentTime = audioContextRef.current.currentTime - startTimeRef.current;

      // Check for Game End
      if (currentTime > audioBuffer.duration + 1) {
        onGameEnd(scoreState);
        return; // Stop loop
      }

      // 1. Spawn Notes (add to active list)
      while (lastNoteIndexRef.current < notesRef.current.length) {
        const note = notesRef.current[lastNoteIndexRef.current];
        // If note is within lookahead window
        if (note.time - currentTime < LOOKAHEAD_TIME) {
          activeNotesRef.current.push(note);
          lastNoteIndexRef.current++;
        } else {
          break; // Notes are sorted by time
        }
      }

      // 2. Cleanup & Miss Detection
      // We keep notes in active array until they fall off screen or are hit
      // This is slightly inefficient but safe for small counts. 
      // Optimized: filter in place or use a new array.
      let missCount = 0;
      activeNotesRef.current = activeNotesRef.current.filter(note => {
        // Calculate Y
        // time = 0 -> Y = hitY
        // delta = note.time - currentTime. Positive means future.
        // Y = hitY - (delta * SPEED)
        const delta = note.time - currentTime;
        const y = hitY - (delta * NOTE_SPEED);

        // If hit, keep visual for a moment? No, remove immediately for now or show hit effect elsewhere.
        if (note.hit) return false;

        // If missed (passed hit line significantly)
        if (delta < -HIT_WINDOW_GOOD && !note.missed) {
          note.missed = true;
          missCount++;
          // Trigger miss visual?
        }

        // If off screen
        if (y > height + 50) return false;

        return true;
      });

      if (missCount > 0) {
        setScoreState(prev => ({
          ...prev,
          miss: prev.miss + missCount,
          combo: 0
        }));
      }

      // Decay lane effects
      for(let i=0; i<4; i++) {
        laneEffects.current[i] = Math.max(0, laneEffects.current[i] - 0.1);
      }
    }


    // --- RENDER ---
    
    // Clear
    ctx.fillStyle = '#0f172a'; // Match bg-slate-900
    ctx.fillRect(0, 0, width, height);

    // Draw Lanes
    for (let i = 0; i < 4; i++) {
      const x = i * laneWidth;
      
      // Lane Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Key Press Highlight
      if (keyState.current[i] || laneEffects.current[i] > 0) {
        const gradient = ctx.createLinearGradient(x, 0, x, height);
        // Use color from effect or key press
        const opacity = Math.max(keyState.current[i] ? 0.2 : 0, laneEffects.current[i] * 0.5);
        const color = LANE_COLORS[i];
        
        gradient.addColorStop(0, `${color}00`);
        gradient.addColorStop(0.8, color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, `${color}00`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, 0, laneWidth, height);
      }
    }

    // Draw Hit Line
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, hitY);
    ctx.lineTo(width, hitY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Hit Targets (Circles at bottom)
    for (let i = 0; i < 4; i++) {
       const centerX = i * laneWidth + laneWidth / 2;
       ctx.beginPath();
       ctx.arc(centerX, hitY, 20, 0, Math.PI * 2);
       ctx.strokeStyle = LANE_COLORS[i];
       ctx.lineWidth = 2;
       ctx.stroke();

       // Label (Key)
       ctx.fillStyle = 'rgba(255,255,255,0.5)';
       ctx.font = 'bold 16px Rajdhani';
       ctx.textAlign = 'center';
       ctx.textBaseline = 'middle';
       ctx.fillText(LANE_KEYS[i], centerX, hitY + 40);
    }

    // Draw Notes
    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
        const currentTime = audioContextRef.current ? audioContextRef.current.currentTime - startTimeRef.current : 0;
        
        activeNotesRef.current.forEach(note => {
            const delta = note.time - currentTime;
            const y = hitY - (delta * NOTE_SPEED);
            const x = note.lane * laneWidth;
            const centerX = x + laneWidth / 2;

            // Simple Note: Rect or Rounded Rect
            ctx.fillStyle = LANE_COLORS[note.lane];
            ctx.shadowBlur = 15;
            ctx.shadowColor = LANE_COLORS[note.lane];
            
            // Note Body
            ctx.beginPath();
            ctx.roundRect(centerX - 30, y - 10, 60, 20, 5);
            ctx.fill();

            // Inner Highlight
            ctx.fillStyle = 'white';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.roundRect(centerX - 25, y - 5, 50, 10, 3);
            ctx.fill();
        });
    }

    requestRef.current = requestAnimationFrame(render);
  }, [gameState, audioBuffer.duration, onGameEnd, scoreState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, [render]);


  // Touch Handling for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (gameState !== GameState.PLAYING) return;
    
    // We need to map touches to lanes
    // Get bounding rect
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const laneWidth = rect.width / 4;

    Array.from(e.changedTouches).forEach(touch => {
      const touchX = touch.clientX - rect.left;
      const laneIndex = Math.floor(touchX / laneWidth);
      if (laneIndex >= 0 && laneIndex <= 3) {
        keyState.current[laneIndex] = true;
        handleInput(laneIndex);
      }
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const laneWidth = rect.width / 4;
    
    Array.from(e.changedTouches).forEach(touch => {
        const touchX = touch.clientX - rect.left;
        const laneIndex = Math.floor(touchX / laneWidth);
        if (laneIndex >= 0 && laneIndex <= 3) {
          keyState.current[laneIndex] = false;
        }
      });
  };


  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900">
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
            <div className="text-4xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                {scoreState.score.toLocaleString()}
            </div>
            <div className="text-sm text-cyan-400 font-bold tracking-widest">SCORE</div>
        </div>
        <div className="flex flex-col items-center">
             <div className="text-6xl font-display font-black italic text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] transition-all transform scale-100" style={{ transform: `scale(${1 + Math.min(scoreState.combo / 50, 0.5)})` }}>
                {scoreState.combo}
            </div>
            <div className="text-xs text-yellow-200 uppercase tracking-[0.5em]">Combo</div>
        </div>
        <div className="text-right">
             <div className="text-xs text-green-400">PERFECT: {scoreState.perfect}</div>
             <div className="text-xs text-blue-400">GOOD: {scoreState.good}</div>
             <div className="text-xs text-rose-400">MISS: {scoreState.miss}</div>
        </div>
      </div>

      {/* PAUSE MENU OVERLAY */}
      {gameState === GameState.PAUSED && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-6">
            <h2 className="text-5xl font-display text-white tracking-widest mb-4">PAUSED</h2>
            <Button onClick={handlePause} icon={<Play size={20} />}>Resume</Button>
            <Button variant="secondary" onClick={() => { stopAudio(); initAudio(); setScoreState({...scoreState, score:0, combo:0, miss:0, perfect:0, good:0}); }} icon={<RotateCcw size={20} />}>Restart</Button>
            <Button variant="danger" onClick={onExit} icon={<MenuIcon size={20} />}>Exit to Menu</Button>
        </div>
      )}

      {/* CONTROLS (Pause Button) */}
      <div className="absolute top-4 right-1/2 translate-x-1/2 z-20">
         <button onClick={handlePause} className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-white border border-slate-600 transition-colors">
            {gameState === GameState.PAUSED ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
         </button>
      </div>

      {/* CANVAS CONTAINER */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full max-w-2xl mx-auto relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border-x border-slate-800"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
    </div>
  );
};

// Helper for restart logic
const initAudio = () => {}; // Placeholder for clean reset logic if needed inside component, but easier to just remount