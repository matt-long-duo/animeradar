
import { Calendar, Star, Play } from 'lucide-react';
import { Anime } from '../../types/anime';
import { formatDate } from '../../utils/formatters';
import { STREAMING_PLATFORM_COLORS, DEFAULT_PLATFORM_COLOR } from '../../constants/streaming';

interface AnimeCardProps {
  anime: Anime;
}

const AnimeCard = ({ anime }: AnimeCardProps) => {
  const getStreamingPlatformColor = (platform: string) => {
    return STREAMING_PLATFORM_COLORS[platform.toLowerCase()] || DEFAULT_PLATFORM_COLOR;
  };

  const renderStreamingSection = () => {
    if (anime.streaming && anime.streaming.length > 0) {
      // Show real streaming platforms only
      return (
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-4 h-4 text-anime-primary" />
            <span className="text-sm font-medium">Streaming on:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {anime.streaming.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getStreamingPlatformColor(platform.name)} hover:opacity-80 transition-opacity cursor-pointer`}
              >
                {platform.name}
              </a>
            ))}
          </div>
        </div>
      );
    }

    // Don't show anything if no streaming data is available
    // This is better than showing misleading "no platforms found" message
    return null;
  };

  return (
    <div className="anime-card">
      <div className="relative">
        <img
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
        {anime.score && (
          <a
            href={`https://myanimelist.net/anime/${anime.mal_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1 hover:bg-yellow-300 transition-colors cursor-pointer"
            title="View on MyAnimeList"
          >
            <Star className="w-3 h-3" />
            {anime.score.toFixed(2)}
          </a>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">
          {anime.title_english || anime.title}
        </h3>
        
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <span className="text-base" title="Japanese broadcast date">🇯🇵</span>
          <span>{formatDate(anime.aired.from)}</span>
        </div>

        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {anime.genres.slice(0, 3).map((genre) => (
              <span
                key={genre.mal_id}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {renderStreamingSection()}

        {anime.synopsis && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-3">
            {anime.synopsis}
          </p>
        )}
      </div>
    </div>
  );
};

export default AnimeCard; 