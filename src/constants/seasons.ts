import { Season } from '../types/anime';

export const SEASONS: { value: Season; label: string; emoji: string }[] = [
  { value: 'spring', label: 'Spring', emoji: '🌸' },
  { value: 'summer', label: 'Summer', emoji: '☀️' },
  { value: 'fall', label: 'Fall', emoji: '🍂' },
  { value: 'winter', label: 'Winter', emoji: '❄️' }
];

export const SEASON_COLORS = {
  spring: '#48bb78',
  summer: '#f6ad55', 
  fall: '#ed8936',
  winter: '#4299e1'
} as const; 