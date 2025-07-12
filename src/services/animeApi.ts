import axios from 'axios';
import { SeasonResponse, Season, Anime } from '../types/anime';

const BASE_URL = 'https://api.jikan.moe/v4';
const KITSU_BASE_URL = 'https://kitsu.io/api/edge';

// Rate limiting: Jikan API has rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AnimeApiService {
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 1000; // 1 second between requests

  private async makeRequest<T>(url: string): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await delay(this.rateLimitDelay - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
    
    try {
      const response = await axios.get<T>(url);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getSeasonalAnime(year: number, season: Season): Promise<Anime[]> {
    const url = `${BASE_URL}/seasons/${year}/${season}`;
    const response = await this.makeRequest<SeasonResponse>(url);
    
    // Phase 1: Return anime WITHOUT streaming data (no misleading information)
    const animeWithoutStreaming = response.data.map(anime => ({
      ...anime,
      streaming: undefined // No streaming data initially
    }));
    
    return animeWithoutStreaming;
  }

  // Enhanced method for fetching real streaming data in parallel
  async enhanceWithRealStreamingData(animeList: Anime[]): Promise<Anime[]> {
    const BATCH_SIZE = 10; // Process 10 anime at a time
    const batches = [];
    
    // Split anime into batches
    for (let i = 0; i < animeList.length; i += BATCH_SIZE) {
      batches.push(animeList.slice(i, i + BATCH_SIZE));
    }
    
    const enhancedAnime: Anime[] = [];
    
    // Process each batch in parallel
    for (const batch of batches) {
      const batchPromises = batch.map(async (anime) => {
        const streamingData = await this.getStreamingDataFromKitsu(anime.title);
        return {
          ...anime,
          streaming: streamingData.length > 0 ? streamingData : undefined
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      enhancedAnime.push(...batchResults);
      
      // Small delay between batches to be respectful to the API
      if (batches.indexOf(batch) < batches.length - 1) {
        await delay(1000);
      }
    }
    
    return enhancedAnime;
  }

  async getCurrentSeason(): Promise<SeasonResponse> {
    const url = `${BASE_URL}/seasons/now`;
    return this.makeRequest<SeasonResponse>(url);
  }

  async getUpcomingSeason(): Promise<SeasonResponse> {
    const url = `${BASE_URL}/seasons/upcoming`;
    return this.makeRequest<SeasonResponse>(url);
  }

  // Get real streaming data from Kitsu API
  private async getStreamingDataFromKitsu(animeTitle: string): Promise<Array<{name: string; url: string}>> {
    try {
      // Reduced rate limit for better performance
      await delay(200);
      
      // Search for anime on Kitsu
      const searchUrl = `${KITSU_BASE_URL}/anime?filter[text]=${encodeURIComponent(animeTitle)}&include=streamingLinks&page[limit]=1`;
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (searchResponse.data.data.length === 0) {
        // No anime found - return empty array (no misleading data)
        return [];
      }
      
      // Get streaming links from included data
      const streamingLinks = searchResponse.data.included?.filter(
        (item: any) => item.type === 'streamingLinks'
      ) || [];
      
      if (streamingLinks.length === 0) {
        // No streaming links found - return empty array
        return [];
      }
      
      // Map streaming links to our format
      const platforms = streamingLinks.map((link: any) => ({
        name: this.mapStreamingPlatformName(link.attributes.url),
        url: link.attributes.url
      }));
      
      // Filter out unknown platforms
      const validPlatforms = platforms.filter((platform: any) => platform.name !== 'Unknown');
      
      // Only return valid platforms
      return validPlatforms;
      
    } catch (error) {
      // Fail gracefully - return empty array (no misleading data)
      return [];
    }
  }

  // Map streaming URLs to platform names
  private mapStreamingPlatformName(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('crunchyroll')) return 'Crunchyroll';
    if (hostname.includes('funimation')) return 'Funimation';
    if (hostname.includes('netflix')) return 'Netflix';
    if (hostname.includes('hulu')) return 'Hulu';
    if (hostname.includes('vrv')) return 'VRV';
    if (hostname.includes('hidive')) return 'Hidive';
    if (hostname.includes('amazon')) return 'Amazon Prime';
    if (hostname.includes('disney')) return 'Disney+';
    if (hostname.includes('tubi')) return 'Tubi';
    if (hostname.includes('youtube')) return 'YouTube';
    
    return 'Unknown';
  }

  getCurrentSeasonInfo(): { season: Season; year: number } {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();
    
    let season: Season;
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else season = 'winter';
    
    return { season, year };
  }
}

export const animeApiService = new AnimeApiService(); 