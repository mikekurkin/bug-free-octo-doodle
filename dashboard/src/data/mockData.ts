import { subDays } from 'date-fns';
import { Game } from '../types/data';

// Helper function to generate proper UUIDs
const generateTeamId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Constants for generating mock data
const LOCATIONS = ['Olympic Stadium', 'Central Arena', 'Sports Complex'] as const;

// Use UUIDs for series and ranks
export const series = [
  { _id: '8a7b6c5d-4e3f-2d1c-0b9a-8c7d6e5f4a3b', name: 'Spring Tournament', slug: 'spring-tournament' },
  { _id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', name: 'Summer League', slug: 'summer-league' },
  { _id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', name: 'Fall Championship', slug: 'fall-championship' },
] as const;

export const rankMappings = [
  { _id: 'rank-none-001', name: 'None', image_urls: [] },
  { _id: 'rank-rambo-001', name: 'Rambo', image_urls: ['/ranks/rambo.png'] },
  { _id: 'rank-chuck-001', name: 'Chuck', image_urls: ['/ranks/chuck.png'] },
  { _id: 'rank-legend-001', name: 'Legend', image_urls: ['/ranks/legend.png'] },
] as const;

// Mock cities with integer IDs
export const cities = [
  { _id: 1, name: 'London', slug: 'london', timezone: 'Europe/London' },
  { _id: 2, name: 'Paris', slug: 'paris', timezone: 'Europe/Paris' },
  { _id: 3, name: 'Berlin', slug: 'berlin', timezone: 'Europe/Berlin' },
] as const;

// Generate 200 team names
const TEAMS = [
  // Color animals
  ...[
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Black',
    'White',
    'Purple',
    'Orange',
    'Silver',
    'Golden',
    'Bronze',
    'Crimson',
    'Azure',
    'Emerald',
    'Amber',
  ].flatMap(color =>
    ['Dragons', 'Eagles', 'Wolves', 'Lions', 'Tigers', 'Bears', 'Hawks', 'Panthers', 'Falcons', 'Sharks'].map(
      animal => `${color} ${animal}`
    )
  ),

  // City teams
  ...['London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Moscow', 'Tokyo', 'Beijing', 'Seoul', 'Sydney'].flatMap(city =>
    ['Warriors', 'Knights', 'Hunters', 'Legends', 'Masters'].map(suffix => `${city} ${suffix}`)
  ),

  // Fantasy teams
  'Storm Riders',
  'Thunder Lords',
  'Frost Giants',
  'Fire Phoenixes',
  'Shadow Hunters',
  'Light Bringers',
  'Star Gazers',
  'Moon Walkers',
  'Sun Chasers',
  'Wind Runners',
];

// Generate teams with UUID-like IDs
export const teams = TEAMS.map(name => ({
  _id: generateTeamId(),
  city_id: cities[Math.floor(Math.random() * cities.length)]._id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  inconsistent_rank: Math.random() > 0.9,
}));

// Update game generation
export const games = Array.from({ length: 50 }, (_, i) => {
  const seriesEntry = series[Math.floor(Math.random() * series.length)];
  return {
    _id: i + 1, // Integer ID for games
    city_id: cities[Math.floor(Math.random() * cities.length)]._id,
    series_id: seriesEntry._id,
    number: Math.floor(Math.random() * 10 + 1).toString(),
    date: new Date(subDays(new Date(), i)),
    price: Math.floor(Math.random() * 50) + 50,
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    address: '123 Game Street',
    is_stream: Math.random() > 0.8,
    processed: true,
  };
});

// Update game results generation to use new IDs
export const gameResults = games
  .flatMap(game => {
    const resultCount = Math.floor(Math.random() * 21) + 20; // 20-40 teams
    const gameTeams = [...teams].sort(() => Math.random() - 0.5).slice(0, resultCount);

    return gameTeams.map((team, index) => ({
      _id: `result-${game._id}-${index}`,
      game_id: game._id,
      team_id: team._id,
      rounds: Array.from({ length: 7 }, () => Math.floor(Math.random() * 6)),
      sum: 0, // Will be calculated
      place: 0, // Will be calculated
      rank_id: rankMappings[Math.floor(Math.random() * rankMappings.length)]._id,
      has_errors: Math.random() > 0.95,
    }));
  })
  .map(result => ({
    ...result,
    sum: result.rounds.reduce((a, b) => a + b, 0),
  }));

// Calculate places for each game
games.forEach(game => {
  const results = gameResults
    .filter(r => r.game_id === game._id)
    .sort((a, b) => b.sum - a.sum)
    .map((result, index) => ({
      ...result,
      place: index + 1,
    }));

  // Update the places in the original array
  results.forEach(result => {
    const index = gameResults.findIndex(r => r._id === result._id);
    if (index !== -1) {
      gameResults[index] = result;
    }
  });
});

// Helper function to get game number (unchanged)
export const getGameNumber = (game: Game): number => {
  const gamesInPackageAndSeries = games
    .filter(g => g.number === game.number && g.series_id === game.series_id)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  return gamesInPackageAndSeries.findIndex(g => g._id === game._id) + 1;
};
