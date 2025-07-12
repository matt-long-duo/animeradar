import { useState, useEffect } from 'react';
import { Anime, Season } from '../types/anime';
import { animeApiService } from '../services/animeApi';

export const useAnimeData = (currentSeason: Season, currentYear: number) => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnimeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get anime with streaming data
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
      
      setAnimeList(sortedAnime);
      setLoading(false);
      
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
    error,
    refetch: fetchAnimeData
  };
}; 