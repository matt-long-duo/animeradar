export const STREAMING_PLATFORM_COLORS: Record<string, string> = {
  'crunchyroll': 'bg-orange-500',
  'funimation': 'bg-purple-500',
  'netflix': 'bg-red-500',
  'hulu': 'bg-green-500',
  'vrv': 'bg-yellow-500',
  'hidive': 'bg-blue-500',
  'amazon prime': 'bg-blue-600',
  'disney+': 'bg-blue-700',
  'tubi': 'bg-pink-500',
  'youtube': 'bg-red-600'
};

export const DEFAULT_PLATFORM_COLOR = 'bg-gray-500';

export const FALLBACK_PLATFORMS = [
  { name: 'Crunchyroll', url: 'https://crunchyroll.com' },
  { name: 'Funimation', url: 'https://funimation.com' },
  { name: 'Netflix', url: 'https://netflix.com' },
  { name: 'Hulu', url: 'https://hulu.com' },
  { name: 'Hidive', url: 'https://hidive.com' }
]; 