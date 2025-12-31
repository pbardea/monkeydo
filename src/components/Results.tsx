import { useEffect } from 'react';
import { getWpmOverTime } from '../utils/stats';
import type { TypingStats, KeystrokeData } from '../utils/stats';
import { Chart } from './Chart';

interface ResultsProps {
  stats: TypingStats;
  keystrokes: KeystrokeData[];
  startTime: number;
  endTime: number;
  onRestart: () => void;
  onOpenSettings: () => void;
}

export function Results({ stats, keystrokes, startTime, onRestart, onOpenSettings }: ResultsProps) {
  const wpmData = getWpmOverTime(keystrokes, startTime);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onRestart();
      }
      // Cmd+K / Ctrl+K is handled globally in App.tsx
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="bg-monkey-bg/50 rounded-lg p-8 border border-monkey-muted/20">
        <h2 className="text-3xl font-bold mb-8 text-center text-monkey-accent">Test Complete</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-monkey-text">{stats.wpm}</div>
            <div className="text-sm text-monkey-muted mt-1">WPM</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-monkey-text">{stats.rawWpm}</div>
            <div className="text-sm text-monkey-muted mt-1">Raw WPM</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-monkey-text">{stats.accuracy}%</div>
            <div className="text-sm text-monkey-muted mt-1">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-monkey-text">{stats.timeElapsed}s</div>
            <div className="text-sm text-monkey-muted mt-1">Time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-monkey-text">{stats.totalChars}</div>
            <div className="text-sm text-monkey-muted mt-1">Characters</div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-monkey-text">WPM Over Time</h3>
          <Chart data={wpmData} />
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-monkey-accent text-monkey-bg font-semibold rounded hover:opacity-90 transition-opacity"
          >
            Restart (Enter/Escape)
          </button>
          <button
            onClick={onOpenSettings}
            className="px-6 py-3 border border-monkey-muted text-monkey-text font-semibold rounded hover:bg-monkey-muted/20 transition-colors"
          >
            Settings (Tab)
          </button>
        </div>
      </div>
    </div>
  );
}
