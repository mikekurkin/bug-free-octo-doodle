import { getGameNumber, games as mockGames, gameResults as mockResults } from '../data/mockData';
import { Game, GameResult, PaginatedResponse, QueryParams, TeamStats } from '../types/data';

// Simulate server-side pagination and filtering
const PAGE_SIZE = 20;

export const fetchGames = async (params: QueryParams): Promise<PaginatedResponse<Game>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter games by city
  let filteredGames = mockGames;
  if (params.city_id) {
    filteredGames = mockGames.filter(game => game.city_id === parseInt(params.city_id));
  }

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredGames = filteredGames.filter(
      game =>
        game._id.toString().includes(searchLower) ||
        game.date.toISOString().toLowerCase().includes(searchLower) ||
        game.series_id.toLowerCase().includes(searchLower) ||
        game.number.includes(searchLower) ||
        game.location.toLowerCase().includes(searchLower)
    );
  }

  // Apply series filter
  if (params.series) {
    filteredGames = filteredGames.filter(game => game.series_id === params.series);
  }

  // Apply sorting
  const sortField = params.sort || 'date';
  const sortOrder = params.order || 'desc';

  filteredGames.sort((a: Game, b: Game) => {
    const modifier = sortOrder === 'desc' ? -1 : 1;
    const aValue = a[sortField as keyof Game];
    const bValue = b[sortField as keyof Game];
    return (aValue > bValue ? 1 : -1) * modifier;
  });

  // Apply pagination
  const startIndex = params.cursor ? parseInt(params.cursor) : 0;
  const endIndex = startIndex + (params.limit || PAGE_SIZE);
  const paginatedGames = filteredGames.slice(startIndex, endIndex);

  return {
    data: paginatedGames,
    total: filteredGames.length,
    hasMore: endIndex < filteredGames.length,
    nextCursor: endIndex < filteredGames.length ? endIndex.toString() : undefined,
  };
};

export const fetchGameResults = async (params: QueryParams): Promise<PaginatedResponse<GameResult>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredResults = [...mockResults];

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredResults = filteredResults.filter(result => result.team.toLowerCase().includes(searchLower));
  }

  // Filter by game series
  if (params.series && params.series !== 'all') {
    filteredResults = filteredResults.filter(result => {
      const game = mockGames.find(g => g.id === result.game_id);
      return game?.series === params.series;
    });
  }

  // Filter by team
  if (params.team) {
    filteredResults = filteredResults.filter(result => result.team === params.team);
  }

  // Apply sorting
  if (params.sort) {
    filteredResults.sort((a: GameResult, b: GameResult) => {
      const modifier = params.order === 'desc' ? -1 : 1;
      const key = params.sort as keyof GameResult;
      return (a[key] > b[key] ? 1 : -1) * modifier;
    });
  }

  const startIndex = params.cursor ? parseInt(params.cursor) : 0;
  const endIndex = startIndex + (params.limit || PAGE_SIZE);
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  return {
    data: paginatedResults,
    total: filteredResults.length,
    hasMore: endIndex < filteredResults.length,
    nextCursor: endIndex < filteredResults.length ? endIndex.toString() : undefined,
  };
};

export const fetchTeamStats = async (params: QueryParams): Promise<PaginatedResponse<TeamStats>> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter teams by city first
  let filteredTeams = teams;
  if (params.city_id) {
    filteredTeams = teams.filter(team => team.city_id === parseInt(params.city_id));
  }

  // Calculate team stats
  let teamStats = filteredTeams.map(team => {
    const teamResults = gameResults.filter(result => result.team_id === team._id);
    const teamGames = games.filter(game =>
      teamResults.some(r => r.game_id === game._id) &&
      game.city_id === team.city_id
    );

    return {
      team_id: team._id,
      team_name: team.name,
      slug: team.slug,
      totalPoints: teamResults.reduce((sum, r) => sum + r.sum, 0),
      gamesPlayed: teamGames.length,
      avgPoints: teamGames.length ?
        teamResults.reduce((sum, r) => sum + r.sum, 0) / teamGames.length : 0,
      bestPlace: teamResults.length ?
        Math.min(...teamResults.map(r => r.place)) : 0,
    };
  });

  // Apply series filter if provided
  if (params.series) {
    teamStats = teamStats.filter(stat => {
      const teamResults = gameResults.filter(result => result.team_id === stat.team_id);
      return teamResults.some(result => {
        const game = games.find(g => g._id === result.game_id);
        return game?.series_id === params.series;
      });
    });
  }

  // Apply sorting
  const sortField = params.sort || 'totalPoints';
  const sortOrder = params.order || 'desc';

  teamStats.sort((a, b) => {
    const modifier = sortOrder === 'desc' ? -1 : 1;
    const aValue = a[sortField as keyof TeamStats];
    const bValue = b[sortField as keyof TeamStats];
    return (aValue > bValue ? 1 : -1) * modifier;
  });

  // Apply pagination
  const startIndex = params.cursor ? parseInt(params.cursor) : 0;
  const endIndex = startIndex + (params.limit || PAGE_SIZE);
  const paginatedStats = teamStats.slice(startIndex, endIndex);

  return {
    data: paginatedStats,
    total: teamStats.length,
    hasMore: endIndex < teamStats.length,
    nextCursor: endIndex < teamStats.length ? endIndex.toString() : undefined,
  };
};

export const fetchGamesByTeam = async (teamId: string, params: QueryParams): Promise<PaginatedResponse<Game>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // First find all game IDs where this team participated
  const teamGameIds = mockResults
    .filter(result => result.team_id === teamId)
    .map(result => result.game_id);

  // Then get the games
  let filteredGames = mockGames.filter(game => teamGameIds.includes(game._id));

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredGames = filteredGames.filter(
      game =>
        game._id.toString().includes(searchLower) ||
        game.date.toISOString().toLowerCase().includes(searchLower) ||
        game.series_id.toLowerCase().includes(searchLower) ||
        game.number.includes(searchLower) ||
        game.location.toLowerCase().includes(searchLower) ||
        getGameNumber(game).toString().includes(searchLower)
    );
  }

  // Apply series filter
  if (params.series) {
    filteredGames = filteredGames.filter(game => game.series_id === params.series);
  }

  // Apply sorting
  const sortField = params.sort || 'date';
  const sortOrder = params.order || 'desc';

  filteredGames.sort((a: Game, b: Game) => {
    const modifier = sortOrder === 'desc' ? -1 : 1;
    const aValue = a[sortField as keyof Game];
    const bValue = b[sortField as keyof Game];
    return (aValue > bValue ? 1 : -1) * modifier;
  });

  // Apply pagination
  const startIndex = params.cursor ? parseInt(params.cursor) : 0;
  const endIndex = startIndex + (params.limit || PAGE_SIZE);
  const paginatedGames = filteredGames.slice(startIndex, endIndex);

  return {
    data: paginatedGames,
    total: filteredGames.length,
    hasMore: endIndex < filteredGames.length,
    nextCursor: endIndex < filteredGames.length ? endIndex.toString() : undefined,
  };
};
