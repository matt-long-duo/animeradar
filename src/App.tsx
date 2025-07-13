import { useState, useMemo } from 'react';
import { Season, Anime } from './types/anime';
import { animeApiService } from './services/animeApi';
import { useAnimeData } from './hooks/useAnimeData';
import SeasonSelector from './components/features/SeasonSelector';
import AnimeCard from './components/features/AnimeCard';
import LoadingSpinner from './components/ui/LoadingSpinner';
import SortingControl, { SortBy, SortOrder } from './components/ui/SortingControl';

function App() {
  // Initialize with current season info to prevent flash of incorrect content
  const { season: initialSeason, year: initialYear } = animeApiService.getCurrentSeasonInfo();
  const [currentSeason, setCurrentSeason] = useState<Season>(initialSeason);
  const [currentYear, setCurrentYear] = useState(initialYear);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<SortBy>('releaseDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Use custom hook for anime data management
  const { animeList, loading, streamingLoading, error, refetch } = useAnimeData(currentSeason, currentYear);

  // Sort anime list based on current sorting criteria
  const sortedAnimeList = useMemo(() => {
    const sorted = [...animeList].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'releaseDate':
          const dateA = new Date(a.aired.from);
          const dateB = new Date(b.aired.from);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'rating':
          const scoreA = a.score || 0;
          const scoreB = b.score || 0;
          comparison = scoreA - scoreB;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [animeList, sortBy, sortOrder]);

  const handleSeasonChange = (season: Season, year: number) => {
    setCurrentSeason(season);
    setCurrentYear(year);
  };

  const handleSortChange = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
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

        {/* Show sorting controls and streaming loading status when anime are ready */}
        {!loading && animeList.length > 0 && (
          <div>
            <SortingControl
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              animeCount={animeList.length}
            />
            {streamingLoading && (
              <div className="text-center mb-4">
                <p className="text-sm text-blue-600">
                  Loading streaming platforms...
                </p>
              </div>
            )}
          </div>
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button
              onClick={refetch}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && animeList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No anime found
            </p>
          </div>
        )}

        {!loading && !error && animeList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedAnimeList.map((anime) => (
              <AnimeCard 
                key={anime.mal_id} 
                anime={anime}
                streamingLoading={streamingLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 