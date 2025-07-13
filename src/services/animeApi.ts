import axios from 'axios';
import { SeasonResponse, Season, Anime } from '../types/anime';
import { streamingService, StreamingPlatform } from './streamingService';

const BASE_URL = 'https://api.jikan.moe/v4';

// Rate limiting: Jikan API has rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AnimeApiService {
  private lastRequestTime = 0;
  private readonly rateLimitDelay = 1000; // 1 second between requests for Jikan API only

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

  // Fast loading - get anime without streaming data
  async getSeasonalAnimeBasic(year: number, season: Season): Promise<Anime[]> {
    const url = `${BASE_URL}/seasons/${year}/${season}`;
    const response = await this.makeRequest<SeasonResponse>(url);
    
    // Return anime with empty streaming arrays for fast initial load
    return response.data.map(anime => ({
      ...anime,
      streaming: []
    }));
  }

  // Progressive streaming data loading - no artificial rate limiting, streaming APIs handle their own
  async getStreamingDataProgressively(
    animeList: Anime[], 
    onBatchComplete: (malId: number, platforms: StreamingPlatform[]) => void
  ): Promise<void> {
    // Process all anime in parallel, but call onBatchComplete as each one finishes
    const streamingPromises = animeList.map(async (anime) => {
      try {
        const streamingResult = await streamingService.findStreamingPlatforms(anime);
        const platforms = streamingResult.platforms || [];
        onBatchComplete(anime.mal_id, platforms);
        return { malId: anime.mal_id, platforms };
      } catch (error) {
        console.error(`Failed to get streaming data for ${anime.title}:`, error);
        onBatchComplete(anime.mal_id, []);
        return { malId: anime.mal_id, platforms: [] };
      }
    });

    // Wait for all to complete
    await Promise.all(streamingPromises);
  }

  // Batch process streaming data for multiple anime (legacy method)
  async batchGetStreamingData(animeList: Anime[]): Promise<Map<number, StreamingPlatform[]>> {
    const streamingMap = new Map<number, StreamingPlatform[]>();
    
    // Process all in parallel - streaming APIs have their own rate limiting
    const batchResults = await Promise.all(
      animeList.map(async (anime) => {
        try {
          const streamingResult = await streamingService.findStreamingPlatforms(anime);
          return { malId: anime.mal_id, platforms: streamingResult.platforms || [] };
        } catch (error) {
          console.error(`Failed to get streaming data for ${anime.title}:`, error);
          return { malId: anime.mal_id, platforms: [] };
        }
      })
    );
    
    // Add results to map
    batchResults.forEach(result => {
      streamingMap.set(result.malId, result.platforms);
    });
    
    return streamingMap;
  }

  async getUpcomingSeason(): Promise<SeasonResponse> {
    const url = `${BASE_URL}/seasons/upcoming`;
    return await this.makeRequest<SeasonResponse>(url);
  }

  getCurrentSeasonInfo(): { season: Season; year: number } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    let season: Season;
    if (month >= 1 && month <= 3) {
      season = 'winter';
    } else if (month >= 4 && month <= 6) {
      season = 'spring';
    } else if (month >= 7 && month <= 9) {
      season = 'summer';
    } else {
      season = 'fall';
    }
    
    return { season, year };
  }
}

export const animeApiService = new AnimeApiService(); 