# Anime Season Tracker

A modern web application for tracking seasonal anime releases, showing release dates, streaming platforms, and cover images.

## Features

- **Seasonal Anime Tracking**: Browse anime by season (Spring, Summer, Fall, Winter) and year
- **Rich Information**: Each anime shows:
  - High-quality cover images
  - Release dates
  - **Real streaming platforms** with clickable links
  - Genres
  - Ratings
  - Synopsis
- **Modern UI**: Clean, responsive design with smooth animations
- **Real-time Data**: Fetches data from multiple APIs for comprehensive information

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom anime-themed colors
- **Icons**: Lucide React
- **APIs**: 
  - Jikan API v4 (MyAnimeList) for anime data
  - Kitsu API for real streaming platform information
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

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Usage

1. **Select Season**: Use the season selector to choose between Spring, Summer, Fall, or Winter
2. **Change Year**: Select different years to explore past or upcoming seasons
3. **Browse Anime**: View anime cards with detailed information
4. **Check Streaming**: See which platforms have each anime available

## API Information

This app uses multiple APIs to provide comprehensive anime information:

### Jikan API (MyAnimeList)
- **Purpose**: Main anime data (titles, images, dates, ratings, etc.)
- **Rate Limiting**: 1 request per second
- **Documentation**: [Jikan API](https://jikan.moe/)

### Kitsu API
- **Purpose**: Real streaming platform data
- **Rate Limiting**: Respects API guidelines with 500ms delays
- **Documentation**: [Kitsu API](https://kitsu.docs.apiary.io/)

**Streaming Platforms Supported**:
- Crunchyroll
- Funimation
- Netflix
- Hulu
- Hidive
- Amazon Prime
- Disney+
- VRV
- Tubi
- YouTube

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
- React and Tailwind CSS communities for excellent documentation 