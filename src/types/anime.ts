export interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  aired: {
    from: string;
    to?: string;
  };
  season: string;
  year: number;
  score?: number;
  synopsis?: string;
  genres: Array<{
    mal_id: number;
    name: string;
  }>;
  streaming: Array<{
    name: string;
    url: string;
  }>;
  broadcast?: {
    day: string;
    time: string;
  };
}

export interface SeasonResponse {
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
  data: Anime[];
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface SeasonInfo {
  season: Season;
  year: number;
  displayName: string;
} 