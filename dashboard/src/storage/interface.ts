import type { City, Game, GameResult, RankMapping, Series, Team } from '../types/data';

export interface Storage {
  // City operations
  getCities(): Promise<City[]>;
  getCityBySlug(slug: string): Promise<City | null>;
  getCityById(id: number): Promise<City | null>;

  // Game operations
  getGames(
    params: {
      cityId?: number;
      cursor?: string;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
      series?: string;
    },
    options?: { withSeries: boolean }
  ): Promise<{
    data: Game[];
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  }>;
  getGameById(id: number, options?: { withSeries: boolean }): Promise<Game | null>;
  getGamesByTeam(
    teamId: string,
    params: {
      cursor?: string;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
      series?: string;
    },
    options?: { withSeries: boolean }
  ): Promise<{
    data: Game[];
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  }>;
  getGamesByPackage(seriesId: string, packageNumber: string): Promise<Game[]>;

  // Result operations
  getGameResults(gameId: number, options?: { withTeams: boolean }): Promise<GameResult[]>;
  getTeamResults(teamId: string, options?: { withTeams: boolean }): Promise<GameResult[]>;
  getGameResultsByPackage(seriesId: string, packageNumber: string, options?: { withTeams: boolean }): Promise<GameResult[]>;
  getMaxScoreByPackage(seriesId: string, packageNumber: string): Promise<number>;

  // Team operations
  getTeamBySlug(slug: string, cityId: number): Promise<Team | null>;
  getTeamStats(params: {
    cityId?: number;
    cursor?: string;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    series?: string;
  }): Promise<{
    data: Team[];
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  }>;

  // Series operations
  getSeries(): Promise<Series[]>;
  getSeriesById(id: string): Promise<Series | null>;
  getSeriesBySlug(slug: string): Promise<Series | null>;

  // Rank operations
  getRankMappings(): Promise<RankMapping[]>;
}

export class StorageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'StorageError';
  }
}
