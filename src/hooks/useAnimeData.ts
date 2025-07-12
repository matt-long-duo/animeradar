import { useState, useEffect } from 'react';
import { Anime, Season } from '../types/anime';
import { animeApiService } from '../services/animeApi';

export const useAnimeData = (currentSeason: Season, currentYear: number) => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancementComplete, setEnhancementComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      setEnhancementComplete(false);
      
      // Phase 1: Get anime with fallback streaming data (fast)
      const data = await animeApiService.getSeasonalAnime(currentYear, currentSeason);
      
      // Remove duplicates based on mal_id
      const uniqueAnime = data.filter((anime, index, self) => 
        index === self.findIndex(a => a.mal_id === anime.mal_id)
      );
      
      // Sort by release date ascending
      const sortedAnime = uniqueAnime.sort((a, b) => {
        const dateA = new Date(a.aired.from);
        const dateB = new Date(b.aired.from);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Set anime list immediately - this shows count and cards quickly
      setAnimeList(sortedAnime);
      setLoading(false);
      
      // Phase 2: Enhance with real streaming data (background)
      if (sortedAnime.length > 0) {
        setEnhancing(true);
        try {
          const enhancedAnime = await animeApiService.enhanceWithRealStreamingData(sortedAnime);
          
          // Sort again to maintain order
          const sortedEnhanced = enhancedAnime.sort((a, b) => {
            const dateA = new Date(a.aired.from);
            const dateB = new Date(b.aired.from);
            return dateA.getTime() - dateB.getTime();
          });
          
          setAnimeList(sortedEnhanced);
          setEnhancing(false);
          setEnhancementComplete(true);
          
          // Hide completion message after 1 second
          setTimeout(() => {
            setEnhancementComplete(false);
          }, 1000);
          
        } catch (enhanceError) {
          console.warn('Failed to enhance with real streaming data:', enhanceError);
          // Keep the fallback data, don't show error to user
          setEnhancing(false);
        }
      }
      
    } catch (err) {
      setError('Failed to fetch anime data. Please try again later.');
      console.error('Error fetching anime data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimeData();
  }, [currentSeason, currentYear]);

  return {
    animeList,
    loading,
    enhancing,
    enhancementComplete,
    error,
    refetch: fetchAnimeData
  };
}; 