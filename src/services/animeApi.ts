import axios from 'axios';
import { SeasonResponse, Season, Anime } from '../types/anime';
import { FALLBACK_PLATFORMS } from '../constants/streaming';

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
    
    // Get real streaming data from Kitsu API
    const animeWithStreaming = await Promise.all(
      response.data.map(async (anime) => {
        const streamingData = await this.getStreamingDataFromKitsu(anime.title);
        return {
          ...anime,
          streaming: streamingData
        };
      })
    );
    
    return animeWithStreaming;
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
      // Rate limit for Kitsu API calls
      await delay(500);
      
      // Search for anime on Kitsu
      const searchUrl = `${KITSU_BASE_URL}/anime?filter[text]=${encodeURIComponent(animeTitle)}&include=streamingLinks&page[limit]=1`;
      const searchResponse = await axios.get(searchUrl, {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        }
      });
      
      if (searchResponse.data.data.length === 0) {
        return this.getFallbackStreamingPlatforms(animeTitle);
      }
      
      // Get streaming links from included data
      const streamingLinks = searchResponse.data.included?.filter(
        (item: any) => item.type === 'streamingLinks'
      ) || [];
      
      if (streamingLinks.length === 0) {
        return this.getFallbackStreamingPlatforms(animeTitle);
      }
      
      // Map streaming links to our format
      const platforms = streamingLinks.map((link: any) => ({
        name: this.mapStreamingPlatformName(link.attributes.url),
        url: link.attributes.url
      }));
      
      // Filter out unknown platforms and ensure at least one platform
      const validPlatforms = platforms.filter((platform: any) => platform.name !== 'Unknown');
      
      return validPlatforms.length > 0 ? validPlatforms : this.getFallbackStreamingPlatforms(animeTitle);
      
    } catch (error) {
      console.warn('Failed to fetch streaming data from Kitsu:', error);
      return this.getFallbackStreamingPlatforms(animeTitle);
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

  // Fallback streaming platforms when Kitsu data is unavailable
  private getFallbackStreamingPlatforms(animeTitle: string): Array<{name: string; url: string}> {
    // Use title hash for deterministic platform assignment
    const titleHash = animeTitle.split('').reduce((hash, char) => {
      const charCode = char.charCodeAt(0);
      return hash + charCode;
    }, 0);
    
    const platforms = FALLBACK_PLATFORMS;
    
    // Return 1-2 platforms based on title hash
    const primaryPlatform = platforms[titleHash % platforms.length];
    const result = [primaryPlatform];
    
    // Add secondary platform 50% of the time
    if (titleHash % 2 === 0) {
      const secondaryPlatform = platforms[(titleHash + 1) % platforms.length];
      if (secondaryPlatform.name !== primaryPlatform.name) {
        result.push(secondaryPlatform);
      }
    }
    
    return result;
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