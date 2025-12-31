export interface KeystrokeData {
  timestamp: number;
  char: string;
  correct: boolean;
  corrected?: boolean; // true if backspace was used to correct this
  skipped?: boolean; // true if character was skipped (space jump)
}

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  timeElapsed: number; // in seconds
}

export function calculateStats(
  keystrokes: KeystrokeData[],
  startTime: number,
  endTime: number
): TypingStats {
  const timeElapsed = (endTime - startTime) / 1000; // convert to seconds
  const timeInMinutes = timeElapsed / 60;

  const correctChars = keystrokes.filter(k => k.correct).length;
  const incorrectChars = keystrokes.filter(k => !k.correct).length;
  const totalChars = keystrokes.length;

  // WPM = (correct characters / 5) / time in minutes
  const wpm = timeInMinutes > 0 ? (correctChars / 5) / timeInMinutes : 0;
  
  // Raw WPM = (total characters / 5) / time in minutes
  const rawWpm = timeInMinutes > 0 ? (totalChars / 5) / timeInMinutes : 0;

  // Accuracy = (correct / total) * 100
  const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;

  return {
    wpm: Math.round(wpm),
    rawWpm: Math.round(rawWpm),
    accuracy: Math.round(accuracy * 100) / 100,
    correctChars,
    incorrectChars,
    totalChars,
    timeElapsed: Math.round(timeElapsed * 100) / 100,
  };
}

export function getWpmOverTime(
  keystrokes: KeystrokeData[],
  startTime: number,
  intervalSeconds: number = 1
): Array<{ time: number; wpm: number }> {
  const data: Array<{ time: number; wpm: number }> = [];
  const intervals: number[] = [];
  
  if (keystrokes.length === 0) return data;

  const endTime = keystrokes[keystrokes.length - 1].timestamp;
  let currentTime = startTime + intervalSeconds * 1000;

  while (currentTime <= endTime) {
    intervals.push(currentTime);
    currentTime += intervalSeconds * 1000;
  }

  intervals.forEach(intervalEnd => {
    const keystrokesInInterval = keystrokes.filter(
      k => k.timestamp >= startTime && k.timestamp <= intervalEnd
    );
    
    if (keystrokesInInterval.length > 0) {
      const timeElapsed = (intervalEnd - startTime) / 1000 / 60; // minutes
      const correctChars = keystrokesInInterval.filter(k => k.correct).length;
      const wpm = timeElapsed > 0 ? (correctChars / 5) / timeElapsed : 0;
      
      data.push({
        time: (intervalEnd - startTime) / 1000,
        wpm: Math.round(wpm),
      });
    }
  });

  return data;
}
