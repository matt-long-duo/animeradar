import axios from 'axios';
import { Anime } from '../types/anime';

export interface StreamingPlatform {
  name: string;
  url: string;
  confidence: 'high' | 'medium' | 'low';
  source: string;
}

export interface StreamingResult {
  platforms: StreamingPlatform[];
  searchedTerms: string[];
  source: string;
  success: boolean;
}

class StreamingService {
  private readonly KITSU_BASE_URL = 'https://kitsu.io/api/edge';
  // private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  private readonly WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';
  // private readonly TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '442f737bf360bf27690398a1a07f6be8';
  private readonly WATCHMODE_API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY || 'vr7qhIPvwk1f8z8V7AXoNh8bVSUvDRPI4TlgB392';
  
  // Rate limiting
  private lastKitsuRequestTime = 0;
  // private lastTmdbRequestTime = 0;
  private lastWatchmodeRequestTime = 0;
  private readonly kitsuRateLimitDelay = 500; // 500ms between requests for Kitsu
  // private readonly tmdbRateLimitDelay = 250; // 250ms between requests for TMDB (40 per 10 seconds)
  private readonly watchmodeRateLimitDelay = 1000; // 1000ms between requests for WatchMode

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeKitsuRequest<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastKitsuRequestTime;
    
    if (timeSinceLastRequest < this.kitsuRateLimitDelay) {
      await this.delay(this.kitsuRateLimitDelay - timeSinceLastRequest);
    }

    this.lastKitsuRequestTime = Date.now();
    
    try {
      const response = await axios.get<T>(url, { headers });
      return response.data;
    } catch (error) {
      console.error('❌ KITSU: Request failed:', error);
      throw error;
    }
  }

  // private async makeTmdbRequest<T>(url: string): Promise<T> {
  //   const now = Date.now();
  //   const timeSinceLastRequest = now - this.lastTmdbRequestTime;
  //   
  //   if (timeSinceLastRequest < this.tmdbRateLimitDelay) {
  //     await this.delay(this.tmdbRateLimitDelay - timeSinceLastRequest);
  //   }

  //   this.lastTmdbRequestTime = Date.now();
  //   
  //   try {
  //     const response = await axios.get<T>(url);
  //     return response.data;
  //   } catch (error) {
  //     console.error('❌ TMDB: Request failed:', error);
  //     throw error;
  //   }
  // }

  private async makeWatchmodeRequest<T>(url: string): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastWatchmodeRequestTime;
    
    if (timeSinceLastRequest < this.watchmodeRateLimitDelay) {
      await this.delay(this.watchmodeRateLimitDelay - timeSinceLastRequest);
    }

    this.lastWatchmodeRequestTime = Date.now();
    
    try {
      const response = await axios.get<T>(url);
      return response.data;
    } catch (error) {
      console.error('❌ WATCHMODE: Request failed:', error);
      throw error;
    }
  }

  // Primary: Kitsu API search
  private async searchKitsu(title: string): Promise<StreamingPlatform[]> {
    try {
      console.log(`🔍 KITSU: Searching for "${title}"`);
      
      const searchUrl = `${this.KITSU_BASE_URL}/anime?filter[text]=${encodeURIComponent(title)}&include=streamingLinks&page[limit]=1`;
      const searchData = await this.makeKitsuRequest<any>(searchUrl);

      if (!searchData.data || searchData.data.length === 0) {
        console.log('ℹ️  KITSU: No results found');
        return [];
      }

      console.log(`✓ Found match for "${title}"`);

      const platforms: StreamingPlatform[] = [];
      
      if (searchData.included) {
        const streamingLinks = searchData.included.filter((item: any) => item.type === 'streamingLinks');
        console.log(`  Found ${streamingLinks.length} streaming links`);
        
        for (const link of streamingLinks) {
          if (link.attributes?.url) {
            platforms.push({
              name: this.extractPlatformName(link.attributes.url),
              url: link.attributes.url,
              confidence: 'high',
              source: 'Kitsu'
            });
          }
        }
      }

      if (platforms.length === 0) {
        console.log('ℹ️  KITSU: No streaming platforms found');
      } else {
        console.log(`✓ KITSU: Found ${platforms.length} platforms:`, platforms.map(p => p.name));
      }

      return platforms;
    } catch (error) {
      console.error('❌ KITSU: Search failed:', error);
      return [];
    }
  }

  // Backup 1: TMDB API search - COMMENTED OUT
  // private async searchTmdb(title: string): Promise<StreamingPlatform[]> {
  //   try {
  //     console.log(`🔍 TMDB: Searching for "${title}"`);
  //     
  //     // Search for TV show on TMDB
  //     const searchUrl = `${this.TMDB_BASE_URL}/search/tv?api_key=${this.TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=en-US&page=1&include_adult=false`;
  //     
  //     const searchResponse = await this.makeTmdbRequest<any>(searchUrl);
  //     
  //     if (!searchResponse.results || searchResponse.results.length === 0) {
  //       console.log('ℹ️  TMDB: No results found');
  //       return [];
  //     }

  //     const tvShow = searchResponse.results[0];
  //     console.log(`✓ TMDB: Found "${tvShow.name}" (ID: ${tvShow.id})`);

  //     // Get watch providers for the TV show
  //     const watchProvidersUrl = `${this.TMDB_BASE_URL}/tv/${tvShow.id}/watch/providers?api_key=${this.TMDB_API_KEY}`;
  //     const providersResponse = await this.makeTmdbRequest<any>(watchProvidersUrl);

  //     const platforms: StreamingPlatform[] = [];
  //     
  //     // Check US providers (you can expand this for other regions)
  //     const usProviders = providersResponse.results?.US;
  //     if (usProviders) {
  //       // Flatrate (subscription services)
  //       if (usProviders.flatrate) {
  //         for (const provider of usProviders.flatrate) {
  //           platforms.push({
  //             name: provider.provider_name,
  //             url: `https://www.themoviedb.org/tv/${tvShow.id}/watch?locale=US`,
  //             confidence: 'medium',
  //             source: 'TMDB'
  //           });
  //         }
  //       }
  //       
  //       // Buy/Rent options
  //       if (usProviders.buy) {
  //         for (const provider of usProviders.buy) {
  //           platforms.push({
  //             name: provider.provider_name,
  //             url: `https://www.themoviedb.org/tv/${tvShow.id}/watch?locale=US`,
  //             confidence: 'medium',
  //             source: 'TMDB'
  //           });
  //         }
  //       }
  //     }

  //     if (platforms.length === 0) {
  //       console.log('ℹ️  TMDB: No streaming platforms found');
  //     } else {
  //       console.log(`✓ TMDB: Found ${platforms.length} platforms:`, platforms.map(p => p.name));
  //     }

  //     return platforms;
  //   } catch (error) {
  //     console.error('❌ TMDB: Search failed:', error);
  //     return [];
  //   }
  // }

  // Backup 1: WatchMode API search (TMDB commented out)
  private async searchWatchmode(title: string): Promise<StreamingPlatform[]> {
    try {
      console.log(`🔍 WATCHMODE: Searching for "${title}"`);
      
      // Search for title on WatchMode
      const searchUrl = `${this.WATCHMODE_BASE_URL}/search/?apiKey=${this.WATCHMODE_API_KEY}&search_field=name&search_value=${encodeURIComponent(title)}&types=tv`;
      
      const searchResponse = await this.makeWatchmodeRequest<any>(searchUrl);
      
      if (!searchResponse.title_results || searchResponse.title_results.length === 0) {
        console.log('ℹ️  WATCHMODE: No results found');
        return [];
      }

      const tvShow = searchResponse.title_results[0];
      console.log(`✓ WATCHMODE: Found "${tvShow.name}" (ID: ${tvShow.id})`);

      // Get streaming sources for the title
      const sourcesUrl = `${this.WATCHMODE_BASE_URL}/title/${tvShow.id}/sources/?apiKey=${this.WATCHMODE_API_KEY}&regions=US`;
      const sourcesResponse = await this.makeWatchmodeRequest<any>(sourcesUrl);

      const platforms: StreamingPlatform[] = [];
      
      if (Array.isArray(sourcesResponse)) {
        for (const source of sourcesResponse) {
          if (source.web_url) {
            platforms.push({
              name: source.name,
              url: source.web_url,
              confidence: 'medium',
              source: 'WatchMode'
            });
          }
        }
      }

      if (platforms.length === 0) {
        console.log('ℹ️  WATCHMODE: No streaming platforms found');
      } else {
        console.log(`✓ WATCHMODE: Found ${platforms.length} platforms:`, platforms.map(p => p.name));
      }

      return platforms;
    } catch (error) {
      console.error('❌ WATCHMODE: Search failed:', error);
      return [];
    }
  }

  async findStreamingPlatforms(anime: Anime): Promise<StreamingResult> {
    const searchTerms: string[] = [];
    let allPlatforms: StreamingPlatform[] = [];
    let successfulSource = '';

    // Primary search terms
    if (anime.title_english) {
      searchTerms.push(anime.title_english);
    }
    if (anime.title && anime.title !== anime.title_english) {
      searchTerms.push(anime.title);
    }

    console.log(`🎬 STREAMING SEARCH: "${anime.title_english || anime.title}"`);

    // Phase 1: Try Kitsu API with all search terms first
    console.log('🔍 Phase 1: Trying Kitsu API (Primary)');
    for (const searchTerm of searchTerms) {
      const kitsuPlatforms = await this.searchKitsu(searchTerm);
      if (kitsuPlatforms.length > 0) {
        allPlatforms = kitsuPlatforms;
        successfulSource = 'Kitsu';
        break;
      }
    }

    // Phase 2: Only try WatchMode if Kitsu found nothing
    if (allPlatforms.length === 0) {
      console.log('🔍 Phase 2: Kitsu found nothing, trying WatchMode API (Backup)');
      for (const searchTerm of searchTerms) {
        const watchmodePlatforms = await this.searchWatchmode(searchTerm);
        if (watchmodePlatforms.length > 0) {
          allPlatforms = watchmodePlatforms;
          successfulSource = 'WatchMode';
          break;
        }
      }
    }

    const success = allPlatforms.length > 0;
    
    if (success) {
      console.log(`✅ STREAMING SUCCESS: Found ${allPlatforms.length} platforms via ${successfulSource}`);
    } else {
      console.log(`❌ STREAMING FAILED: No platforms found after trying Kitsu and WatchMode APIs`);
    }

    return {
      platforms: allPlatforms,
      searchedTerms: searchTerms,
      source: successfulSource || 'None',
      success
    };
  }

  private extractPlatformName(url: string): string {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // Map common domains to platform names
      const platformMap: Record<string, string> = {
        'crunchyroll.com': 'Crunchyroll',
        'funimation.com': 'Funimation',
        'netflix.com': 'Netflix',
        'hulu.com': 'Hulu',
        'vrv.co': 'VRV',
        'hidive.com': 'Hidive',
        'amazon.com': 'Amazon Prime',
        'primevideo.com': 'Amazon Prime',
        'disney.com': 'Disney+',
        'disneyplus.com': 'Disney+',
        'tubi.tv': 'Tubi',
        'youtube.com': 'YouTube'
      };

      for (const [domain_part, platform] of Object.entries(platformMap)) {
        if (domain.includes(domain_part)) {
          return platform;
        }
      }

      // Fallback: capitalize the main domain part
      const mainDomain = domain.split('.')[0];
      return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
    } catch {
      return 'Unknown Platform';
    }
  }
}

export const streamingService = new StreamingService(); 