import { useState, useEffect } from 'react';

export type TextMode = 'words' | 'quotes';
export type LengthMode = 'words' | 'time';

export interface Settings {
  wordCount: number;
  timeLimit: number | null; // seconds, null if word-based
  lengthMode: LengthMode;
  includeNumbers: boolean;
  includePunctuation: boolean;
  includeCapitals: boolean;
  removeProperNouns: boolean;
  expandedWordList: boolean;
  textMode: TextMode;
}

const defaultSettings: Settings = {
  wordCount: 25,
  timeLimit: null,
  lengthMode: 'words',
  includeNumbers: false,
  includePunctuation: false,
  includeCapitals: false,
  removeProperNouns: false,
  expandedWordList: false,
  textMode: 'words',
};

const STORAGE_KEY = 'monkeydo-settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    updateSetting,
  };
}
