import { useState, useEffect, useCallback, useRef } from 'react';
import type { KeystrokeData } from '../utils/stats';
import type { Settings } from './useSettings';
import { generateText, splitIntoLines } from '../utils/wordGenerator';
import { loadWords } from '../data/words';

export interface TypingTestState {
  text: string;
  lines: string[];
  currentIndex: number;
  keystrokes: KeystrokeData[];
  startTime: number | null;
  endTime: number | null;
  isComplete: boolean;
  isStarted: boolean;
}

export function useTypingTest(settings: Settings) {
  const [state, setState] = useState<TypingTestState>({
    text: '',
    lines: [],
    currentIndex: 0,
    keystrokes: [],
    startTime: null,
    endTime: null,
    isComplete: false,
    isStarted: false,
  });

  const [words, setWords] = useState<string[]>([]);
  const timeLimitRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load words on mount and when settings change
  useEffect(() => {
    loadWords(settings.expandedWordList).then(setWords);
  }, [settings.expandedWordList]);

  // Generate new text when settings change or words load
  useEffect(() => {
    if (words.length > 0 && !state.isStarted) {
      const newText = generateText(settings, words);
      const newLines = splitIntoLines(newText);
      setState(prev => ({
        ...prev,
        text: newText,
        lines: newLines,
        currentIndex: 0,
        keystrokes: [],
        startTime: null,
        endTime: null,
        isComplete: false,
      }));
    }
  }, [settings, words, state.isStarted]);

  const handleKeyPress = useCallback((key: string) => {
    if (state.isComplete) return;

    const now = Date.now();

    // Set time limit if in time mode (on first keystroke)
    if (!state.isStarted && settings.lengthMode === 'time' && settings.timeLimit) {
      timeLimitRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isComplete: true,
          endTime: Date.now(),
        }));
      }, settings.timeLimit * 1000);
    }

    // Handle space key
    if (key === ' ') {
      const currentChar = state.text[state.currentIndex];
      const prevChar = state.currentIndex > 0 ? state.text[state.currentIndex - 1] : null;
      
      // Ignore space if we're already at a space (double space) or if previous char was a space
      if (currentChar === ' ' || prevChar === ' ') {
        // Just advance past the space(s) without recording keystroke
        let skipIndex = state.currentIndex;
        while (skipIndex < state.text.length && state.text[skipIndex] === ' ') {
          skipIndex++;
        }
        
        if (skipIndex < state.text.length) {
          setState(prev => ({
            ...prev,
            currentIndex: skipIndex,
            startTime: prev.startTime ?? now,
            isStarted: true,
          }));
        }
        return; // Ignore the space keystroke
      }
      
      // If we're not at a space, jump to the next space (end of current word)
      if (currentChar !== ' ') {
        setState(prev => {
          let jumpIndex = prev.currentIndex;
          // Find the next space
          while (jumpIndex < prev.text.length && prev.text[jumpIndex] !== ' ') {
            jumpIndex++;
          }
          
          // Mark all remaining characters as skipped
          const newKeystrokes = [...prev.keystrokes];
          for (let i = prev.currentIndex; i < jumpIndex; i++) {
            newKeystrokes[i] = {
              timestamp: now,
              char: prev.text[i],
              correct: false,
              skipped: true,
            };
          }
          
          // If we found a space, add it to keystrokes
          if (jumpIndex < prev.text.length) {
            newKeystrokes[jumpIndex] = {
              timestamp: now,
              char: ' ',
              correct: true,
            };
          }

          const newIndex = jumpIndex < prev.text.length ? jumpIndex + 1 : jumpIndex;
          const testComplete = newIndex >= prev.text.length;
          
          // Clean up timeout if test completes
          if (testComplete && timeLimitRef.current) {
            clearTimeout(timeLimitRef.current);
            timeLimitRef.current = null;
          }
          
          // Use prev.startTime if already set, otherwise use now (first keystroke)
          const finalStartTime = prev.startTime ?? now;
          
          return {
            ...prev,
            currentIndex: newIndex,
            keystrokes: newKeystrokes,
            startTime: finalStartTime,
            isStarted: true,
            isComplete: testComplete,
            endTime: testComplete ? now : prev.endTime,
          };
        });
        
        return; // Early return, we've handled the space
      }
    }

    // Normal character handling
    const expectedChar = state.text[state.currentIndex];
    const isCorrect = key === expectedChar;

    const newKeystroke: KeystrokeData = {
      timestamp: now,
      char: key,
      correct: isCorrect,
    };

    setState(prev => {
      const newIndex = prev.currentIndex + 1;
      const testComplete = newIndex >= prev.text.length;
      
      // Replace keystroke at current position instead of appending
      const newKeystrokes = [...prev.keystrokes];
      newKeystrokes[prev.currentIndex] = newKeystroke;
      
      // Use prev.startTime if already set, otherwise use now (first keystroke)
      const finalStartTime = prev.startTime ?? now;
      
      return {
        ...prev,
        currentIndex: newIndex,
        keystrokes: newKeystrokes,
        startTime: finalStartTime,
        isStarted: true,
        isComplete: testComplete,
        endTime: testComplete ? now : prev.endTime,
      };
    });

    // Clean up timeout if test completes early
    if (state.currentIndex + 1 >= state.text.length && timeLimitRef.current) {
      clearTimeout(timeLimitRef.current);
      timeLimitRef.current = null;
    }
  }, [state, settings]);

  const handleBackspace = useCallback(() => {
    if (state.currentIndex === 0 || state.isComplete) return;

    setState(prev => {
      const newIndex = prev.currentIndex - 1;
      const newKeystrokes = [...prev.keystrokes];
      
      // Mark the previous keystroke as corrected
      if (newKeystrokes[newIndex]) {
        newKeystrokes[newIndex] = {
          ...newKeystrokes[newIndex],
          corrected: true,
        };
      }

      return {
        ...prev,
        currentIndex: newIndex,
        keystrokes: newKeystrokes,
        isComplete: false, // Uncomplete if we go back
      };
    });
  }, [state]);

  const handleBackspaceWord = useCallback(() => {
    if (state.currentIndex === 0 || state.isComplete) return;

    setState(prev => {
      let newIndex = prev.currentIndex;
      const text = prev.text;
      
      // Find the start of the current word
      // If we're at a space, skip it and find the previous word
      if (newIndex > 0 && text[newIndex - 1] === ' ') {
        newIndex = newIndex - 1; // Skip the space
      }
      
      // Go back to find the start of the word (space or beginning)
      while (newIndex > 0 && text[newIndex - 1] !== ' ') {
        newIndex = newIndex - 1;
      }

      // Mark all keystrokes from newIndex to currentIndex as corrected
      const newKeystrokes = [...prev.keystrokes];
      for (let i = newIndex; i < prev.currentIndex; i++) {
        if (newKeystrokes[i]) {
          newKeystrokes[i] = {
            ...newKeystrokes[i],
            corrected: true,
          };
        }
      }

      return {
        ...prev,
        currentIndex: newIndex,
        keystrokes: newKeystrokes,
        isComplete: false,
      };
    });
  }, [state]);

  const reset = useCallback(() => {
    if (timeLimitRef.current) {
      clearTimeout(timeLimitRef.current);
      timeLimitRef.current = null;
    }

    if (words.length > 0) {
      const newText = generateText(settings, words);
      const newLines = splitIntoLines(newText);
      setState({
        text: newText,
        lines: newLines,
        currentIndex: 0,
        keystrokes: [],
        startTime: null,
        endTime: null,
        isComplete: false,
        isStarted: false,
      });
    }
  }, [settings, words]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeLimitRef.current) {
        clearTimeout(timeLimitRef.current);
      }
    };
  }, []);

  return {
    text: state.text,
    lines: state.lines,
    currentIndex: state.currentIndex,
    keystrokes: state.keystrokes,
    startTime: state.startTime,
    endTime: state.endTime,
    isComplete: state.isComplete,
    isStarted: state.isStarted,
    handleKeyPress,
    handleBackspace,
    handleBackspaceWord,
    reset,
  };
}
