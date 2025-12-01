import React, { useState, useEffect } from 'react';
import { SongSelector } from './components/SongSelector';
import { GameCanvas } from './components/GameCanvas';
import { Results } from './components/Results';
import { GameState, Note, ScoreState } from './types';
import { analyzeAudio } from './utils/audioProcessor';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [isLoading, setIsLoading] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [finalScore, setFinalScore] = useState<ScoreState | null>(null);

  const processAudioFile = async (arrayBuffer: ArrayBuffer) => {
    setIsLoading(true);
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      
      const { buffer, notes } = await analyzeAudio(arrayBuffer, audioCtx);
      
      setAudioBuffer(buffer);
      setNotes(notes);
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error("Error processing audio:", error);
      alert("Could not process audio file. Please try a different file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        processAudioFile(e.target.result);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTrackSelect = async (url: string) => {
    setIsLoading(true);
    try {
      // Fetch the audio file from the provided URL
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const arrayBuffer = await response.arrayBuffer();
      await processAudioFile(arrayBuffer);
    } catch (error) {
      console.error("Track load failed", error);
      alert("Failed to load track. Please check your internet connection.");
      setIsLoading(false);
    }
  };

  const handleGameEnd = (score: ScoreState) => {
    setFinalScore(score);
    setGameState(GameState.RESULTS);
  };

  const handleRetry = () => {
    // Reset game state to playing with same buffer/notes
    setGameState(GameState.PLAYING);
  };

  const handleMenu = () => {
    setAudioBuffer(null);
    setNotes([]);
    setFinalScore(null);
    setGameState(GameState.MENU);
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      {gameState === GameState.MENU && (
        <SongSelector 
          onSongSelected={handleFileSelect} 
          onTrackSelect={handleTrackSelect}
          isLoading={isLoading}
        />
      )}

      {gameState === GameState.PLAYING && audioBuffer && (
        <GameCanvas 
          audioBuffer={audioBuffer} 
          notes={notes} 
          onGameEnd={handleGameEnd}
          onExit={handleMenu}
        />
      )}

      {gameState === GameState.RESULTS && finalScore && (
        <Results 
          score={finalScore} 
          onRetry={handleRetry} 
          onMenu={handleMenu} 
        />
      )}
    </div>
  );
};

export default App;
