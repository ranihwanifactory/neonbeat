import { Note } from '../types';

export const analyzeAudio = async (arrayBuffer: ArrayBuffer, context: AudioContext): Promise<{ buffer: AudioBuffer; notes: Note[] }> => {
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  const notes: Note[] = [];

  // Get raw PCM data from the first channel (mono analysis is usually sufficient for rhythm)
  const rawData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Analysis config
  const windowSize = 0.05; // 50ms windows
  const samplesPerWindow = Math.floor(sampleRate * windowSize);
  const totalWindows = Math.floor(rawData.length / samplesPerWindow);
  
  let previousEnergy = 0;
  const energyHistory: number[] = [];
  
  // 1. Calculate Energy Profile
  for (let i = 0; i < totalWindows; i++) {
    const start = i * samplesPerWindow;
    let sum = 0;
    for (let j = 0; j < samplesPerWindow; j++) {
      const amplitude = rawData[start + j];
      sum += amplitude * amplitude;
    }
    const rms = Math.sqrt(sum / samplesPerWindow);
    energyHistory.push(rms);
  }

  // 2. Peak Detection & Note Generation
  // We use a dynamic threshold based on local average to adapt to quiet/loud parts
  const localHistorySize = 20; // Look at roughly 1 second of history
  
  for (let i = 0; i < energyHistory.length; i++) {
    const energy = energyHistory[i];
    
    // Calculate local average energy
    let localSum = 0;
    let count = 0;
    for (let k = Math.max(0, i - localHistorySize); k < i; k++) {
      localSum += energyHistory[k];
      count++;
    }
    const localAverage = count > 0 ? localSum / count : 0;

    // Detect Onset
    // 1. Energy must be significantly higher than local average (beat)
    // 2. Energy must be higher than previous frame (rising edge)
    // 3. Absolute threshold to avoid silence noise
    const isPeak = energy > localAverage * 1.3 && energy > previousEnergy && energy > 0.05;

    if (isPeak) {
      // Cooldown check: Don't spawn notes too close together
      const lastNote = notes[notes.length - 1];
      const time = i * windowSize;
      
      if (!lastNote || (time - lastNote.time > 0.15)) { // 150ms minimum gap
        // Assign lane based on energy intensity or simple rotation for variety
        // A simple way to make it fun: randomly pick a lane, but bias slightly based on intensity
        // Or simpler: strictly procedural rotation for flow
        
        const intensity = energy / (localAverage + 0.001);
        let lane: 0 | 1 | 2 | 3 = 0;
        
        if (lastNote) {
            // Avoid same lane spam unless very high intensity
            let newLane = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
            while(newLane === lastNote.lane && Math.random() > 0.2) {
                newLane = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
            }
            lane = newLane;
        } else {
             lane = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
        }

        // Special: If super intense, maybe add a double note (chord)? 
        // For this demo, we keep it single notes for clarity.

        notes.push({
          id: `note-${i}`,
          time: time,
          lane: lane,
          hit: false,
          missed: false
        });
      }
    }
    previousEnergy = energy;
  }

  return { buffer: audioBuffer, notes };
};
