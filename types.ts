export enum GameState {
  MENU = 'MENU',
  ANALYZING = 'ANALYZING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  RESULTS = 'RESULTS'
}

export interface Note {
  id: string;
  time: number; // The exact time in seconds when the note should be hit
  lane: 0 | 1 | 2 | 3;
  hit: boolean;
  missed: boolean;
}

export interface SongMetadata {
  name: string;
  duration: number;
  buffer: AudioBuffer;
}

export interface ScoreState {
  perfect: number;
  good: number;
  miss: number;
  combo: number;
  maxCombo: number;
  score: number;
}

export const LANE_KEYS = ['D', 'F', 'J', 'K'];
export const LANE_COLORS = [
  '#f472b6', // Pink
  '#22d3ee', // Cyan
  '#22d3ee', // Cyan
  '#f472b6'  // Pink
];
