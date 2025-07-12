import React from 'react';
import { Season } from '../types/anime';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SeasonSelectorProps {
  currentSeason: Season;
  currentYear: number;
  onSeasonChange: (season: Season, year: number) => void;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  currentSeason,
  currentYear,
  onSeasonChange
}) => {
  const seasons: { value: Season; label: string; emoji: string }[] = [
    { value: 'spring', label: 'Spring', emoji: '🌸' },
    { value: 'summer', label: 'Summer', emoji: '☀️' },
    { value: 'fall', label: 'Fall', emoji: '🍂' },
    { value: 'winter', label: 'Winter', emoji: '❄️' }
  ];

  const handleYearChange = (increment: number) => {
    onSeasonChange(currentSeason, currentYear + increment);
  };

  return (
    <div className="mb-8 max-w-md mx-auto">
      {/* Year Selector - Mobile-first with touch-friendly buttons */}
      <div className="mb-6">
        <div className="flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <button
            onClick={() => handleYearChange(-1)}
            className="p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 text-center">
            <span className="text-xl font-bold text-gray-800">{currentYear}</span>
          </div>
          
          <button
            onClick={() => handleYearChange(1)}
            className="p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
            aria-label="Next year"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Season Segmented Control */}
      <div className="bg-gray-100 rounded-xl p-1 shadow-sm">
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-0">
          {seasons.map((season, index) => (
            <button
              key={season.value}
              onClick={() => onSeasonChange(season.value, currentYear)}
              className={`
                relative h-[56px] px-3 py-2 text-sm font-medium transition-all duration-200 touch-manipulation flex items-center justify-center
                ${index === 0 ? 'rounded-l-lg sm:rounded-l-lg sm:rounded-r-none' : ''}
                ${index === 1 ? 'rounded-r-lg sm:rounded-none' : ''}
                ${index === 2 ? 'rounded-l-lg sm:rounded-none' : ''}
                ${index === 3 ? 'rounded-r-lg sm:rounded-r-lg sm:rounded-l-none' : ''}
                ${
                  currentSeason === season.value
                    ? 'bg-white text-anime-primary shadow-sm border border-gray-200 z-10'
                    : 'bg-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
              aria-pressed={currentSeason === season.value}
              aria-label={`Select ${season.label} season`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg leading-none">{season.emoji}</span>
                <span className="text-xs font-medium">{season.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeasonSelector; 