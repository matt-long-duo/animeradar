import React from 'react';

export type SortBy = 'name' | 'releaseDate' | 'rating';
export type SortOrder = 'asc' | 'desc';

interface SortingControlProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  animeCount: number;
}

const SortingControl: React.FC<SortingControlProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  animeCount
}) => {
  const handleSortByChange = (newSortBy: SortBy) => {
    // If same sort field, toggle order; otherwise use ascending
    const newOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(newSortBy, newOrder);
  };

  const getSortIcon = (field: SortBy) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getSortButtonClass = (field: SortBy) => {
    const baseClass = "px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1";
    const activeClass = "bg-blue-500 text-white";
    const inactiveClass = "bg-gray-200 text-gray-700 hover:bg-gray-300";
    
    return `${baseClass} ${sortBy === field ? activeClass : inactiveClass}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700 mr-2">Sort by:</span>
      
      <button
        onClick={() => handleSortByChange('releaseDate')}
        className={getSortButtonClass('releaseDate')}
      >
        Release Date
        <span className="ml-1">{getSortIcon('releaseDate')}</span>
      </button>
      
      <button
        onClick={() => handleSortByChange('name')}
        className={getSortButtonClass('name')}
      >
        Name
        <span className="ml-1">{getSortIcon('name')}</span>
      </button>
      
      <button
        onClick={() => handleSortByChange('rating')}
        className={getSortButtonClass('rating')}
      >
        Rating
        <span className="ml-1">{getSortIcon('rating')}</span>
      </button>
    </div>
  );
};

export default SortingControl; 