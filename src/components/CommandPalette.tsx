import { useEffect } from 'react';
import { Command } from 'cmdk';
import { useSettings } from '../hooks/useSettings';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { settings, updateSetting } = useSettings();

  // Keyboard navigation: j/k as aliases for arrow keys, space to toggle
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
      const isInputFocused = document.activeElement === input;
      const isTyping = input && input.value.length > 0;
      
      // Map j/k to arrow keys for navigation (only when not typing in search)
      if ((e.key === 'j' || e.key === 'k') && (!isInputFocused || !isTyping)) {
        e.preventDefault();
        const command = document.querySelector('[cmdk-root]');
        if (command) {
          const event = new KeyboardEvent('keydown', {
            key: e.key === 'j' ? 'ArrowDown' : 'ArrowUp',
            bubbles: true,
            cancelable: true,
          });
          command.dispatchEvent(event);
        }
      } else if (e.key === ' ' && !isInputFocused) {
        e.preventDefault();
        const selected = document.querySelector('[cmdk-item][data-selected="true"]') as HTMLElement;
        if (selected) {
          selected.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [open]);

  const wordCountOptions = [10, 25, 50, 100];
  const timeOptions = [15, 30, 60, 120];

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
      label="Settings"
      shouldFilter={true}
    >
      <Command className="bg-monkey-bg border border-monkey-muted/30 rounded-lg shadow-2xl w-full max-w-2xl max-h-[60vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="px-4 py-3 border-b border-monkey-muted/20">
          <Command.Input
            placeholder="Search settings..."
            className="w-full bg-transparent text-monkey-text placeholder-monkey-muted outline-none text-base font-normal"
            autoFocus
          />
        </div>
        <Command.List className="p-2 overflow-y-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-monkey-muted/30 scrollbar-track-transparent">
          <Command.Empty className="text-monkey-muted text-center py-12 text-sm">
            No results found.
          </Command.Empty>

          <Command.Group heading="Word Count" className="text-monkey-muted text-xs font-medium px-2 py-2 uppercase tracking-wider">
            {wordCountOptions.map(count => (
              <Command.Item
                key={count}
                value={`word count ${count}`}
                onSelect={() => {
                  updateSetting('wordCount', count);
                  updateSetting('lengthMode', 'words');
                  updateSetting('timeLimit', null);
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm text-monkey-text data-[selected]:bg-monkey-muted/20 data-[selected]:text-monkey-text transition-colors"
              >
                <span>{count} words</span>
                {settings.wordCount === count && settings.lengthMode === 'words' && (
                  <span className="text-monkey-accent text-base">✓</span>
                )}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Time Limit" className="text-monkey-muted text-xs font-medium px-2 py-2 mt-1 uppercase tracking-wider">
            {timeOptions.map(time => (
              <Command.Item
                key={time}
                value={`time ${time} seconds`}
                onSelect={() => {
                  updateSetting('timeLimit', time);
                  updateSetting('lengthMode', 'time');
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm text-monkey-text data-[selected]:bg-monkey-muted/20 data-[selected]:text-monkey-text transition-colors"
              >
                <span>{time} seconds</span>
                {settings.timeLimit === time && settings.lengthMode === 'time' && (
                  <span className="text-monkey-accent text-base">✓</span>
                )}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Text Mode" className="text-monkey-muted text-xs font-medium px-2 py-2 mt-1 uppercase tracking-wider">
            <Command.Item
              value="words mode"
              onSelect={() => updateSetting('textMode', 'words')}
              className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm text-monkey-text data-[selected]:bg-monkey-muted/20 data-[selected]:text-monkey-text transition-colors"
            >
              <span>Random Words</span>
              {settings.textMode === 'words' && (
                <span className="text-monkey-accent text-base">✓</span>
              )}
            </Command.Item>
            <Command.Item
              value="quotes mode"
              onSelect={() => updateSetting('textMode', 'quotes')}
              className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm text-monkey-text data-[selected]:bg-monkey-muted/20 data-[selected]:text-monkey-text transition-colors"
            >
              <span>Quotes</span>
              {settings.textMode === 'quotes' && (
                <span className="text-monkey-accent text-base">✓</span>
              )}
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Modifiers" className="text-monkey-muted text-xs font-medium px-2 py-2 mt-1 uppercase tracking-wider">
            <Command.Item
              value="include numbers"
              onSelect={() => updateSetting('includeNumbers', !settings.includeNumbers)}
              className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm text-monkey-text data-[selected]:bg-monkey-muted/20 data-[selected]:text-monkey-text transition-colors"
            >
              <span>Include Numbers</span>
              {settings.includeNumbers && (
                <span className="text-monkey-accent text-base">✓</span>
              )}
            </Command.Item>
            <Command.Item
              value="include punctuation"
              onSelect={() => updateSetting('includePunctuation', !settings.includePunctuation)}
              className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm text-monkey-text data-[selected]:bg-monkey-muted/20 data-[selected]:text-monkey-text transition-colors"
            >
              <span>Include Punctuation</span>
              {settings.includePunctuation && (
                <span className="text-monkey-accent text-base">✓</span>
              )}
            </Command.Item>
            <Command.Item
              value="include capitals"
              onSelect={() => updateSetting('includeCapitals', !settings.includeCapitals)}
              className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm text-monkey-text data-[selected]:bg-monkey-muted/20 data-[selected]:text-monkey-text transition-colors"
            >
              <span>Include Capitals</span>
              {settings.includeCapitals && (
                <span className="text-monkey-accent text-base">✓</span>
              )}
            </Command.Item>
            <Command.Item
              value="remove proper nouns"
              onSelect={() => updateSetting('removeProperNouns', !settings.removeProperNouns)}
              className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm text-monkey-text data-[selected]:bg-monkey-muted/20 data-[selected]:text-monkey-text transition-colors"
            >
              <span>Remove Proper Nouns</span>
              {settings.removeProperNouns && (
                <span className="text-monkey-accent text-base">✓</span>
              )}
            </Command.Item>
            <Command.Item
              value="expanded word list"
              onSelect={() => updateSetting('expandedWordList', !settings.expandedWordList)}
              className="flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-sm text-monkey-text data-[selected]:bg-monkey-muted/20 data-[selected]:text-monkey-text transition-colors"
            >
              <span>Expanded Word List</span>
              {settings.expandedWordList && (
                <span className="text-monkey-accent text-base">✓</span>
              )}
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </Command.Dialog>
  );
}
