import { useState, useEffect } from 'react';
import { Anime, Season } from './types/anime';
import { animeApiService } from './services/animeApi';
import SeasonSelector from './components/SeasonSelector';
import AnimeCard from './components/AnimeCard';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with current season info to prevent flash of incorrect content
  const { season: initialSeason, year: initialYear } = animeApiService.getCurrentSeasonInfo();
  const [currentSeason, setCurrentSeason] = useState<Season>(initialSeason);
  const [currentYear, setCurrentYear] = useState(initialYear);

  useEffect(() => {
    fetchAnimeData();
  }, [currentSeason, currentYear]);

  const fetchAnimeData = async () => {
    try {
      setLoading(true);
      setError(null);
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
    } catch (err) {
      setError('Failed to fetch anime data. Please try again later.');
      console.error('Error fetching anime data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonChange = (season: Season, year: number) => {
    setCurrentSeason(season);
    setCurrentYear(year);
  };

  const getSeasonDisplayName = (season: Season) => {
    return season.charAt(0).toUpperCase() + season.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex flex-col items-center">
            <img 
              src="/animeradarlogo.png" 
              alt="AnimeRadar Logo" 
              className="h-16 w-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-anime-dark mb-2">
              AnimeRadar
            </h1>
            <p className="text-lg text-gray-600">
              Discover what's airing this season
            </p>
          </div>
        </header>

        <SeasonSelector
          currentSeason={currentSeason}
          currentYear={currentYear}
          onSeasonChange={handleSeasonChange}
        />

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-anime-dark">
            {getSeasonDisplayName(currentSeason)} {currentYear}
          </h2>
          <p className="text-gray-600 mt-2">
            {animeList.length} anime found
          </p>
        </div>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button
              onClick={fetchAnimeData}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && animeList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No anime found for {getSeasonDisplayName(currentSeason)} {currentYear}
            </p>
          </div>
        )}

        {!loading && !error && animeList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {animeList.map((anime) => (
              <AnimeCard key={anime.mal_id} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 