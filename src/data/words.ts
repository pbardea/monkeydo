// Common words list - will be loaded from common-words.txt
let commonWordsCache: string[] | null = null;
let top1000WordsCache: string[] | null = null;

// Quotes for full text mode
export const quotes = [
  "The quick brown fox jumps over the lazy dog.",
  "To be or not to be, that is the question.",
  "In the beginning was the Word, and the Word was with God.",
  "It was the best of times, it was the worst of times.",
  "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse.",
  "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
  "All happy families are alike; each unhappy family is unhappy in its own way.",
  "The sun was shining on the sea, shining with all his might.",
  "Once upon a time in a galaxy far, far away.",
  "The only way out of the labyrinth of suffering is to forgive.",
];

// List of potentially sensitive words to exclude
const sensitiveWords = new Set<string>([
  // Add common sensitive words here - keeping it minimal for now
  // Users can expand this list as needed
]);

// Filter out sensitive words and invalid words from a word list
function filterSensitiveWords(words: string[]): string[] {
  return words.filter(word => {
    const lowerWord = word.toLowerCase().trim();
    // Filter out:
    // - Sensitive words
    // - Single letters (except 'i' and 'a')
    // - Words shorter than 2 characters
    // - Empty strings
    if (lowerWord.length === 0) return false;
    if (lowerWord.length === 1 && lowerWord !== 'i' && lowerWord !== 'a') return false;
    if (sensitiveWords.has(lowerWord)) return false;
    // Filter out common abbreviations that aren't real words
    const invalidAbbreviations = ['st', 'nd', 'rd', 'th', 'pm', 'am', 'uk', 'us', 'c', 'e', 'n', 's', 'w', 'b', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'p', 'q', 'r', 't', 'u', 'v', 'x', 'y', 'z'];
    if (invalidAbbreviations.includes(lowerWord)) return false;
    return true;
  });
}

// Fallback word list (first 200 most common words)
const fallbackWords = [
  "the", "of", "and", "to", "a", "in", "for", "is", "on", "that", "by", "this", "with", "i", "you", "it", "not", "or", "be", "are",
  "from", "at", "as", "your", "all", "have", "new", "more", "an", "was", "we", "will", "home", "can", "us", "about", "if", "page", "my", "has",
  "search", "free", "but", "our", "one", "other", "do", "no", "information", "time", "they", "site", "he", "up", "may", "what", "which", "their", "news", "out",
  "use", "any", "there", "see", "only", "so", "his", "when", "contact", "here", "business", "who", "web", "also", "now", "help", "get", "pm", "view", "online",
  "first", "am", "been", "would", "how", "were", "me", "services", "some", "these", "click", "its", "like", "service", "than", "find", "price", "date", "back", "top",
  "people", "had", "list", "name", "just", "over", "state", "year", "day", "into", "email", "two", "health", "world", "next", "used", "go", "work", "last", "most",
  "products", "music", "buy", "data", "make", "them", "should", "product", "system", "post", "her", "city", "add", "policy", "number", "such", "please", "available", "copyright", "support",
  "message", "after", "best", "software", "then", "good", "video", "well", "where", "info", "rights", "public", "books", "high", "school", "through", "each", "links", "she", "review",
  "years", "order", "very", "privacy", "book", "items", "company", "read", "group", "need", "many", "user", "said", "does", "set", "under", "general", "research", "university", "mail",
  "full", "map", "reviews", "program", "life", "know", "games", "way", "days", "management", "part", "could", "great", "united", "hotel", "real", "item", "international", "center", "must"
];

export async function loadWords(expanded: boolean = false): Promise<string[]> {
  // Load top 1000 words (default)
  if (!expanded) {
    if (top1000WordsCache) {
      return top1000WordsCache;
    }

    try {
      const response = await fetch('/top-1000-words.txt');
      if (response.ok) {
        const text = await response.text();
        top1000WordsCache = filterSensitiveWords(
          text
            .split('\n')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length > 0)
            .slice(0, 1000)
        );
        return top1000WordsCache;
      }
    } catch (error) {
      console.warn('Failed to load top 1000 word list, using fallback', error);
    }

    // Use fallback if fetch fails
    top1000WordsCache = filterSensitiveWords(fallbackWords.slice(0, 1000));
    return top1000WordsCache;
  }

  // Load expanded word list (full list)
  if (commonWordsCache) {
    return commonWordsCache;
  }

  try {
    const response = await fetch('/common-words.txt');
      if (response.ok) {
        const text = await response.text();
        commonWordsCache = filterSensitiveWords(
          text
            .split('\n')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length > 0)
        );
        return commonWordsCache;
    }
  } catch (error) {
    console.warn('Failed to load expanded word list, using fallback', error);
  }

  // Use fallback if fetch fails
  commonWordsCache = filterSensitiveWords(fallbackWords);
  return commonWordsCache;
}

export function getRandomWords(count: number, words: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    result.push(words[randomIndex]);
  }
  return result;
}

export function getRandomQuote(): string {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
