import { useEffect } from 'react';
import { useTypingTest } from '../hooks/useTypingTest';
import type { Settings } from '../hooks/useSettings';
import { WordDisplay } from './WordDisplay';

interface TypingTestProps {
  settings: Settings;
  onComplete: (state: { keystrokes: any[]; startTime: number; endTime: number }) => void;
  onReset?: () => void;
}

export function TypingTest({ settings, onComplete, onReset }: TypingTestProps) {
  const { text, lines, currentIndex, handleKeyPress, handleBackspace, handleBackspaceWord, isComplete, isStarted, keystrokes, startTime, endTime, reset } = useTypingTest(settings);

  useEffect(() => {
    if (isComplete && startTime && endTime) {
      onComplete({ keystrokes, startTime, endTime });
    }
  }, [isComplete, keystrokes, startTime, endTime, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key to reset
      if (e.key === 'Escape') {
        e.preventDefault();
        reset();
        if (onReset) {
          onReset();
        }
        return;
      }

      // Handle Ctrl+Backspace (word deletion)
      if (e.key === 'Backspace' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleBackspaceWord();
        return;
      }

      // Handle regular backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // Handle Tab - don't prevent default when not typing, let App.tsx handle it
      if (e.key === 'Tab' && !isStarted) {
        return; // Let Tab bubble up to App.tsx for command palette
      }

      // Ignore other modifier key combinations (but allow Ctrl+Backspace handled above)
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key !== 'Backspace') {
        return;
      }

      // Handle regular characters
      if (e.key.length === 1) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleBackspace, reset, onReset, isStarted]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="mb-6 text-center">
        {!isStarted && (
          <p className="text-monkey-muted text-xl">Start typing to begin...</p>
        )}
      </div>
      <div className="bg-monkey-bg/50 rounded-lg p-12 min-h-[300px] flex items-center justify-center border border-monkey-muted/20">
        <WordDisplay text={text} lines={lines} currentIndex={currentIndex} keystrokes={keystrokes} />
      </div>
    </div>
  );
}
