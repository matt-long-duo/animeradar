// Fuzzy string matching utilities for anime title comparison

export interface MatchResult {
  score: number; // 0-1, where 1 is perfect match
  confidence: 'high' | 'medium' | 'low';
  method: string;
}

export class FuzzyMatcher {
  private static readonly HIGH_CONFIDENCE_THRESHOLD = 0.8;
  private static readonly MEDIUM_CONFIDENCE_THRESHOLD = 0.6;

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate Levenshtein similarity score (0-1)
   */
  private static levenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Normalize title for comparison
   */
  private static normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '') // Keep alphanumeric, spaces, and Japanese characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract words from title for word-based matching
   */
  private static extractWords(title: string): Set<string> {
    const normalized = this.normalizeTitle(title);
    const words = normalized.split(/\s+/).filter(word => word.length > 1);
    return new Set(words);
  }

  /**
   * Calculate Jaccard similarity between two sets of words
   */
  private static jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 1 : intersection.size / union.size;
  }

  /**
   * Calculate word-based similarity score
   */
  private static wordSimilarity(title1: string, title2: string): number {
    const words1 = this.extractWords(title1);
    const words2 = this.extractWords(title2);
    return this.jaccardSimilarity(words1, words2);
  }

  /**
   * Check if one title contains significant parts of another
   */
  private static containmentSimilarity(title1: string, title2: string): number {
    const norm1 = this.normalizeTitle(title1);
    const norm2 = this.normalizeTitle(title2);
    
    const shorter = norm1.length < norm2.length ? norm1 : norm2;
    const longer = norm1.length < norm2.length ? norm2 : norm1;
    
    if (shorter.length === 0) return 0;
    
    // Check if shorter string is contained in longer string
    if (longer.includes(shorter)) {
      return shorter.length / longer.length;
    }
    
    // Check for partial containment
    const words1 = this.extractWords(title1);
    const words2 = this.extractWords(title2);
    
    const shorterWords = words1.size < words2.size ? words1 : words2;
    const longerWords = words1.size < words2.size ? words2 : words1;
    
    let matchedWords = 0;
    shorterWords.forEach(word => {
      if (longerWords.has(word)) {
        matchedWords++;
      }
    });
    
    return shorterWords.size === 0 ? 0 : matchedWords / shorterWords.size;
  }

  /**
   * Calculate comprehensive similarity score between two titles
   */
  public static calculateSimilarity(title1: string, title2: string): MatchResult {
    if (!title1 || !title2) {
      return { score: 0, confidence: 'low', method: 'invalid_input' };
    }

    // Exact match
    if (title1.toLowerCase() === title2.toLowerCase()) {
      return { score: 1, confidence: 'high', method: 'exact_match' };
    }

    // Normalized exact match
    const norm1 = this.normalizeTitle(title1);
    const norm2 = this.normalizeTitle(title2);
    
    if (norm1 === norm2) {
      return { score: 0.95, confidence: 'high', method: 'normalized_exact' };
    }

    // Calculate different similarity metrics
    const levenshtein = this.levenshteinSimilarity(norm1, norm2);
    const wordSim = this.wordSimilarity(title1, title2);
    const containment = this.containmentSimilarity(title1, title2);

    // Weighted combination of different metrics
    const combinedScore = (
      levenshtein * 0.4 +
      wordSim * 0.4 +
      containment * 0.2
    );

    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low';
    if (combinedScore >= this.HIGH_CONFIDENCE_THRESHOLD) {
      confidence = 'high';
    } else if (combinedScore >= this.MEDIUM_CONFIDENCE_THRESHOLD) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      score: combinedScore,
      confidence,
      method: 'combined_fuzzy'
    };
  }

  /**
   * Find best match from a list of candidate titles
   */
  public static findBestMatch(
    searchTitle: string,
    candidates: string[],
    minConfidence: 'high' | 'medium' | 'low' = 'medium'
  ): { title: string; result: MatchResult } | null {
    if (!searchTitle || candidates.length === 0) {
      return null;
    }

    let bestMatch: { title: string; result: MatchResult } | null = null;

    for (const candidate of candidates) {
      const result = this.calculateSimilarity(searchTitle, candidate);
      
      // Skip if below minimum confidence
      if (minConfidence === 'high' && result.confidence !== 'high') continue;
      if (minConfidence === 'medium' && result.confidence === 'low') continue;
      
      if (!bestMatch || result.score > bestMatch.result.score) {
        bestMatch = { title: candidate, result };
      }
    }

    return bestMatch;
  }

  /**
   * Check if two titles are likely the same anime
   */
  public static areTitlesSimilar(
    title1: string,
    title2: string,
    minConfidence: 'high' | 'medium' | 'low' = 'medium'
  ): boolean {
    const result = this.calculateSimilarity(title1, title2);
    
    switch (minConfidence) {
      case 'high':
        return result.confidence === 'high';
      case 'medium':
        return result.confidence === 'high' || result.confidence === 'medium';
      case 'low':
        return true; // Accept all confidence levels
      default:
        return result.confidence === 'high' || result.confidence === 'medium';
    }
  }
}

// Convenience functions
export const calculateSimilarity = (title1: string, title2: string): MatchResult => 
  FuzzyMatcher.calculateSimilarity(title1, title2);

export const findBestMatch = (
  searchTitle: string,
  candidates: string[],
  minConfidence: 'high' | 'medium' | 'low' = 'medium'
): { title: string; result: MatchResult } | null => 
  FuzzyMatcher.findBestMatch(searchTitle, candidates, minConfidence);

export const areTitlesSimilar = (
  title1: string,
  title2: string,
  minConfidence: 'high' | 'medium' | 'low' = 'medium'
): boolean => 
  FuzzyMatcher.areTitlesSimilar(title1, title2, minConfidence); 