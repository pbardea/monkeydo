import { useRef, useEffect, useState } from 'react';
import type { KeystrokeData } from '../utils/stats';

interface WordDisplayProps {
  text: string;
  lines: string[];
  currentIndex: number;
  keystrokes: KeystrokeData[];
}

export function WordDisplay({ text, lines, currentIndex, keystrokes }: WordDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0, visible: false });

  // Update cursor position when currentIndex changes
  useEffect(() => {
    const updateCursor = () => {
      if (currentIndex <= text.length && text.length > 0) {
        const targetIndex = Math.min(currentIndex, text.length - 1);
        const charElement = charRefs.current[targetIndex];
        if (charElement && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const charRect = charElement.getBoundingClientRect();
          // Position cursor exactly at the left edge of the current character
          setCursorPosition({
            top: charRect.top - containerRect.top,
            left: charRect.left - containerRect.left - 1,
            visible: true,
          });
        } else if (currentIndex === text.length && charRefs.current[text.length - 1]) {
          // Cursor at the end - position after last character
          const lastChar = charRefs.current[text.length - 1];
          if (lastChar && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const charRect = lastChar.getBoundingClientRect();
            setCursorPosition({
              top: charRect.top - containerRect.top,
              left: charRect.right - containerRect.left - 1,
              visible: true,
            });
          }
        } else {
          setCursorPosition(prev => ({ ...prev, visible: false }));
        }
      } else {
        setCursorPosition(prev => ({ ...prev, visible: false }));
      }
    };

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(updateCursor);
  }, [currentIndex, text.length]);

  const renderChar = (char: string, index: number) => {
    const keystroke = keystrokes[index];
    const isTyped = index < currentIndex;
    const isCurrent = index === currentIndex;
    const isCorrect = keystroke?.correct ?? true;
    const isCorrected = keystroke?.corrected ?? false;
    const isSkipped = keystroke?.skipped ?? false;
    // Only show wrong char if it wasn't corrected and wasn't skipped
    const wrongChar = keystroke && !isCorrect && !isCorrected && !isSkipped ? keystroke.char : null;

    if (isTyped) {
      // Already typed
      let className = 'relative inline-block';
      if (isCorrected) {
        // Corrected characters are yellow
        className += ' text-monkey-accent';
      } else if (isSkipped) {
        // Skipped characters are muted/yellow
        className += ' text-monkey-muted';
      } else if (isCorrect) {
        className += ' text-correct';
      } else {
        className += ' text-incorrect';
      }

      return (
        <span 
          key={index} 
          ref={el => { charRefs.current[index] = el; }}
          className={className}
        >
          {isSkipped && (
            <span className="absolute -top-2 left-0 text-xs text-monkey-muted opacity-70">
              ⏭
            </span>
          )}
          {wrongChar && (
            <span className="absolute -top-2 left-0 text-sm text-monkey-error opacity-70">
              {wrongChar}
            </span>
          )}
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    } else if (isCurrent) {
      // Current character - will be replaced by cursor
      return (
        <span 
          key={index} 
          ref={el => { charRefs.current[index] = el; }}
          className="text-untyped"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    } else {
      // Not yet typed
      return (
        <span 
          key={index} 
          ref={el => { charRefs.current[index] = el; }}
          className="text-untyped"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    }
  };

  // Split text into lines based on the lines array
  let charPos = 0;
  const lineRanges = lines.map(line => {
    const start = charPos;
    const end = start + line.length;
    charPos = end;
    // Account for space between lines (if not last line)
    if (charPos < text.length && text[charPos] === ' ') {
      charPos += 1;
    }
    return { start, end: Math.min(end, text.length) };
  });

  return (
    <div ref={containerRef} className="font-mono text-2xl leading-relaxed select-none w-full relative">
      {lineRanges.map((range, lineIndex) => {
        const lineText = text.slice(range.start, range.end);
        
        return (
          <div key={lineIndex} className="mb-2">
            {lineText.split('').map((char, charIndex) => {
              const globalIndex = range.start + charIndex;
              return renderChar(char, globalIndex);
            })}
          </div>
        );
      })}
      
      {/* Smooth cursor - thin vertical line positioned before character */}
      {cursorPosition.visible && (
        <span
          className="absolute pointer-events-none transition-all duration-100 ease-out"
          style={{
            top: `${cursorPosition.top}px`,
            left: `${cursorPosition.left}px`,
            width: '2px',
            height: '1.75rem',
            backgroundColor: '#e2b714',
          }}
        />
      )}
    </div>
  );
}
