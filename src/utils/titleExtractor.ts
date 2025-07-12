import { Anime } from '../types/anime';

/**
 * Extract all possible title variations from an anime object
 */
export function extractTitleVariations(anime: Anime): string[] {
  const variations: string[] = [];
  
  // Add main title
  if (anime.title) {
    variations.push(anime.title);
  }
  
  // Add English title if different from main title
  if (anime.title_english && anime.title_english !== anime.title) {
    variations.push(anime.title_english);
  }
  
  // Add Japanese title if different from main title
  if (anime.title_japanese && anime.title_japanese !== anime.title) {
    variations.push(anime.title_japanese);
  }
  
  // Add synonyms
  if (anime.title_synonyms && anime.title_synonyms.length > 0) {
    anime.title_synonyms.forEach(synonym => {
      if (synonym && !variations.includes(synonym)) {
        variations.push(synonym);
      }
    });
  }
  
  // Add titles from the titles array (newer Jikan API format)
  if (anime.titles && anime.titles.length > 0) {
    anime.titles.forEach(titleObj => {
      if (titleObj.title && !variations.includes(titleObj.title)) {
        variations.push(titleObj.title);
      }
    });
  }
  
  // Remove duplicates and empty strings
  return [...new Set(variations)].filter(title => title && title.trim().length > 0);
}

/**
 * Get prioritized title variations (most likely to match first)
 */
export function getPrioritizedTitleVariations(anime: Anime): string[] {
  const variations = extractTitleVariations(anime);
  
  // Prioritize titles by likelihood of matching in external APIs
  const prioritized: string[] = [];
  
  // 1. English title (most likely to match in Western APIs)
  if (anime.title_english) {
    prioritized.push(anime.title_english);
  }
  
  // 2. Main title (usually Japanese romanized)
  if (anime.title && anime.title !== anime.title_english) {
    prioritized.push(anime.title);
  }
  
  // 3. Japanese title (for APIs that support Japanese)
  if (anime.title_japanese && anime.title_japanese !== anime.title) {
    prioritized.push(anime.title_japanese);
  }
  
  // 4. Synonyms and other titles
  const remaining = variations.filter(title => 
    title !== anime.title_english && 
    title !== anime.title && 
    title !== anime.title_japanese
  );
  
  prioritized.push(...remaining);
  
  return prioritized;
}

/**
 * Generate search variations for a title (including common transformations)
 */
export function generateSearchVariations(title: string): string[] {
  const variations: string[] = [title];
  
  // Common transformations
  const transformations = [
    // Remove subtitles like "Season 2", "Part 1", etc.
    title.replace(/\s+(season|part|vol|volume|series)\s+\d+$/i, '').trim(),
    // Remove year in parentheses
    title.replace(/\s*\(\d{4}\)$/, '').trim(),
    // Remove special characters
    title.replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, ' ').replace(/\s+/g, ' ').trim(),
    // Common punctuation variations
    title.replace(/:/g, ''),
    title.replace(/!/g, ''),
    title.replace(/\?/g, ''),
    // Remove common prefixes/suffixes
    title.replace(/^(the|a|an)\s+/i, '').trim(),
  ];
  
  // Add unique transformations
  transformations.forEach(variation => {
    if (variation && variation.length > 0 && !variations.includes(variation)) {
      variations.push(variation);
    }
  });
  
  return variations;
}

/**
 * Get all possible search terms for an anime (combines title variations with search transformations)
 */
export function getAllSearchTerms(anime: Anime): string[] {
  const titleVariations = getPrioritizedTitleVariations(anime);
  const searchTerms: string[] = [];
  
  // For each title variation, generate search variations
  titleVariations.forEach(title => {
    const searchVariations = generateSearchVariations(title);
    searchVariations.forEach(variation => {
      if (!searchTerms.includes(variation)) {
        searchTerms.push(variation);
      }
    });
  });
  
  return searchTerms;
}

/**
 * Debug function to log all title variations for an anime
 */
export function debugTitleVariations(anime: Anime): void {
  console.log(`\n🎯 TITLE VARIATIONS for "${anime.title}":`);
  console.log('📝 Raw titles:', {
    title: anime.title,
    title_english: anime.title_english,
    title_japanese: anime.title_japanese,
    title_synonyms: anime.title_synonyms,
    titles: anime.titles
  });
  
  const variations = extractTitleVariations(anime);
  console.log('🔍 Extracted variations:', variations);
  
  const prioritized = getPrioritizedTitleVariations(anime);
  console.log('⭐ Prioritized variations:', prioritized);
  
  const searchTerms = getAllSearchTerms(anime);
  console.log('🔎 All search terms:', searchTerms);
} 