import { useState, useEffect, useCallback } from 'react';
import { TypingTest } from './components/TypingTest';
import { Results } from './components/Results';
import { CommandPalette } from './components/CommandPalette';
import { useSettings } from './hooks/useSettings';
import { calculateStats } from './utils/stats';

function App() {
  const { settings } = useSettings();
  const [showResults, setShowResults] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Global keyboard shortcut for command palette (Tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab key to open command palette (but not when typing test is active)
      if (e.key === 'Tab' && !showResults) {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResults]);
  
  // We need to access typing test state for results
  // This is a bit of a workaround - we'll manage it differently
  const [testState, setTestState] = useState<{
    keystrokes: any[];
    startTime: number;
    endTime: number;
  } | null>(null);

  const handleComplete = useCallback((state: { keystrokes: any[]; startTime: number; endTime: number }) => {
    setTestState(state);
    setShowResults(true);
  }, []);

  const handleRestart = () => {
    setShowResults(false);
    setTestState(null);
  };

  const handleOpenSettings = () => {
    setShowCommandPalette(true);
  };

  // Calculate stats if we have test state
  const stats = testState ? calculateStats(
    testState.keystrokes,
    testState.startTime,
    testState.endTime
  ) : null;

  if (!showResults) {
    return (
      <div className="min-h-screen bg-monkey-bg flex flex-col items-center justify-center">
        <TypingTest settings={settings} onComplete={handleComplete} />
        <CommandPalette 
          open={showCommandPalette} 
          onOpenChange={setShowCommandPalette}
        />
      </div>
    );
  }

  if (!stats || !testState) {
    return null;
  }

  return (
    <div className="min-h-screen bg-monkey-bg flex flex-col items-center justify-center">
      <Results
        stats={stats}
        keystrokes={testState.keystrokes}
        startTime={testState.startTime}
        endTime={testState.endTime}
        onRestart={handleRestart}
        onOpenSettings={handleOpenSettings}
      />
      <CommandPalette 
        open={showCommandPalette} 
        onOpenChange={setShowCommandPalette}
      />
    </div>
  );
}

export default App;
