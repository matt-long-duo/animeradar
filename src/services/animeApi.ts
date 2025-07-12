import axios from 'axios';
import { SeasonResponse, Season, Anime } from '../types/anime';
import { streamingService } from './streamingService';

const BASE_URL = 'https://api.jikan.moe/v4';

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
    
    // Get streaming data for each anime
    const animeWithStreaming = await Promise.all(
      response.data.map(async (anime) => {
        try {
          const streamingResult = await streamingService.findStreamingPlatforms(anime);
          return {
            ...anime,
            streaming: streamingResult.platforms || []
          };
        } catch (error) {
          console.error(`Failed to get streaming data for ${anime.title}:`, error);
          return {
            ...anime,
            streaming: []
          };
        }
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