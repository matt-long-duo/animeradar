# Anime Season Tracker

A modern web application for tracking seasonal anime releases, showing release dates, streaming platforms, and cover images.

## Features

- **Seasonal Anime Tracking**: Browse anime by season (Spring, Summer, Fall, Winter) and year
- **Rich Information**: Each anime shows:
  - High-quality cover images
  - Release dates
  - **Real streaming platforms** (when available) with clickable links
  - Genres
  - Ratings
  - Synopsis
- **Modern UI**: Clean, responsive design with smooth animations
- **Honest Data**: Only shows verified streaming information - no fake or misleading data

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom anime-themed colors
- **Icons**: Lucide React
- **APIs**: 
  - Jikan API v4 (MyAnimeList) for anime data
  - Kitsu API for verified streaming platform information
- **Build Tool**: Vite
- **Development**: ESLint for code quality

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your API keys
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_WATCHMODE_API_KEY=your_watchmode_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

1. **Select Season**: Use the season selector to choose between Spring, Summer, Fall, or Winter
2. **Change Year**: Select different years to explore past or upcoming seasons
3. **Browse Anime**: View anime cards with detailed information
4. **Check Streaming**: See which platforms have each anime available (when streaming data is found)

## API Configuration

### Getting API Keys

To use the backup streaming APIs, you'll need to get free API keys:

1. **TMDB API Key**:
   - Go to [TMDB API](https://developers.themoviedb.org/3/getting-started/introduction)
   - Sign up for a free account
   - Request an API key
   - Add it to your `.env` file as `VITE_TMDB_API_KEY`

2. **WatchMode API Key**:
   - Go to [WatchMode API](https://api.watchmode.com/)
   - Sign up for a free account (includes 1000 requests/month)
   - Get your API key from the dashboard
   - Add it to your `.env` file as `VITE_WATCHMODE_API_KEY`

### API Information

This app uses multiple APIs to provide comprehensive anime information:

### Jikan API (MyAnimeList)
- **Purpose**: Main anime data (titles, images, dates, ratings, etc.)
- **Rate Limiting**: 1 request per second
- **Documentation**: [Jikan API](https://jikan.moe/)

### Kitsu API (Primary Streaming)
- **Purpose**: Primary streaming platform data
- **Rate Limiting**: Respects API guidelines with 500ms delays
- **Documentation**: [Kitsu API](https://kitsu.docs.apiary.io/)
- **Priority**: High confidence streaming data

### TMDB API (Backup #1)
- **Purpose**: First backup streaming platform data when Kitsu has no results
- **Rate Limiting**: 40 requests per 10 seconds (250ms delays)
- **Documentation**: [TMDB API](https://developers.themoviedb.org/3)
- **Setup**: Add your TMDB API key to `.env` as `VITE_TMDB_API_KEY`
- **Priority**: Medium confidence streaming data

### WatchMode API (Backup #2)
- **Purpose**: Final backup streaming platform data with comprehensive coverage
- **Rate Limiting**: Conservative 1000ms delays to respect API limits
- **Documentation**: [WatchMode API](https://api.watchmode.com/docs)
- **Setup**: Add your WatchMode API key to `.env` as `VITE_WATCHMODE_API_KEY`
- **Priority**: Medium confidence streaming data
- **Coverage**: 200+ streaming services across 50+ countries

## Smart Backup System

The app uses a sophisticated **3-tier fallback system** for streaming data:

1. **Kitsu API** (Primary): Anime-specific, high-confidence streaming links
2. **TMDB API** (Backup #1): TV show streaming data with regional availability  
3. **WatchMode API** (Backup #2): Most comprehensive streaming coverage available

**Search Process:**
- For each anime title, the app tries all search terms across all APIs
- Once streaming data is found from any API, the search stops
- If all APIs return no results, no streaming section is shown
- **No fake data is ever displayed** - only real, verified streaming platforms

**Benefits:**
- **Higher Success Rate**: Triple redundancy ensures maximum platform discovery
- **Real Data Only**: Maintains honesty by never showing fabricated streaming information  
- **Performance Optimized**: Stops searching once valid results are found
- **Global Coverage**: WatchMode provides international streaming service data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Jikan API](https://jikan.moe/) for providing MyAnimeList data
- [MyAnimeList](https://myanimelist.net/) for the original anime database
- [Kitsu API](https://kitsu.io/) for verified streaming platform data
- React and Tailwind CSS communities for excellent documentation 