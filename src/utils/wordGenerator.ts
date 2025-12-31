import type { Settings } from '../hooks/useSettings';
import { getRandomWords, getRandomQuote } from '../data/words';

export function generateText(settings: Settings, words: string[]): string {
  if (settings.textMode === 'quotes') {
    return getRandomQuote();
  }

  // Filter out proper nouns if setting is enabled
  let filteredWords = words;
  if (settings.removeProperNouns) {
    filteredWords = words.filter(word => {
      // Filter out common proper nouns (names, places, brands, etc.)
      // Check if word starts with capital letter (common proper nouns)
      // Also filter known proper nouns from common word lists
      const properNouns = [
        'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
        'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
        'pm', 'am', 'uk', 'us', 'usa'
      ];
      return !properNouns.includes(word.toLowerCase());
    });
  }

  const wordList = getRandomWords(settings.wordCount, filteredWords);
  let text = wordList.join(' ');

  // Apply modifiers
  if (settings.includeNumbers) {
    text = addNumbers(text);
  }

  if (settings.includePunctuation) {
    text = addPunctuation(text);
  }

  if (settings.includeCapitals) {
    text = addCapitals(text);
  }

  return text;
}

function addNumbers(text: string): string {
  const words = text.split(' ');
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const result: string[] = [];
  
  // Add numbers as separate words (~15% chance between words)
  words.forEach((word, index) => {
    result.push(word);
    // Add a number word after this word with some probability
    if (index < words.length - 1 && Math.random() < 0.15) {
      // Generate a random number (1-4 digits)
      const numDigits = Math.floor(Math.random() * 4) + 1;
      let numberWord = '';
      for (let i = 0; i < numDigits; i++) {
        numberWord += numbers[Math.floor(Math.random() * numbers.length)];
      }
      result.push(numberWord);
    }
  });
  
  return result.join(' ');
}

function addPunctuation(text: string): string {
  const words = text.split(' ');
  const punctuation = ['.', ',', '!', '?', ';', ':'];
  
  // Add punctuation to ~30% of words
  return words.map((word, index) => {
    if (index === words.length - 1 && Math.random() < 0.5) {
      // End with period
      return word + '.';
    }
    if (Math.random() < 0.3) {
      const punct = punctuation[Math.floor(Math.random() * punctuation.length)];
      return word + punct;
    }
    return word;
  }).join(' ');
}

function addCapitals(text: string): string {
  const words = text.split(' ');
  
  // List of common proper nouns that should be capitalized
  const properNouns = [
    'i', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 
    'august', 'september', 'october', 'november', 'december',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    'america', 'england', 'france', 'germany', 'spain', 'italy', 'japan', 'china',
    'london', 'paris', 'new york', 'los angeles', 'chicago', 'boston',
    'john', 'mary', 'james', 'robert', 'michael', 'william', 'david', 'richard',
    'google', 'apple', 'microsoft', 'amazon', 'facebook', 'twitter'
  ];
  
  return words.map((word, index) => {
    const lowerWord = word.toLowerCase();
    const isProperNoun = properNouns.includes(lowerWord);
    const isFirstWord = index === 0;
    const isAfterPunctuation = index > 0 && /[.!?]$/.test(words[index - 1]);
    
    // Capitalize if:
    // 1. It's the first word of the text
    // 2. It's after punctuation (start of sentence)
    // 3. It's a proper noun
    if (isFirstWord || isAfterPunctuation || isProperNoun) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    return word;
  }).join(' ');
}

export function splitIntoLines(text: string, charsPerLine: number = 60): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if (currentLine.length + word.length + 1 <= charsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  // Ensure we have at least 2 lines
  while (lines.length < 2) {
    lines.push('');
  }

  return lines.slice(0, 2);
}
