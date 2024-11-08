import { parse } from 'csv-parse/browser/esm/sync';
import type { City, Game, GameResult, RankMapping, Series, Team } from '../types/data';
import type { Storage } from './interface';
import { StorageError } from './interface';

export class CsvStorage implements Storage {
  private readonly gamesFile: string;
  private readonly resultsFile: string;
  private readonly citiesFile: string;
  private readonly ranksFile: string;
  private readonly teamsFile: string;
  private readonly seriesFile: string;

  private readonly baseUrl = '/data'; // Will serve from public/data

  constructor() {
    this.gamesFile = 'games.csv';
    this.resultsFile = 'results.csv';
    this.citiesFile = 'cities.csv';
    this.ranksFile = 'ranks.csv';
    this.teamsFile = 'teams.csv';
    this.seriesFile = 'series.csv';
  }

  private async fetchCsv(filename: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      return parse(content, {
        columns: true,
        skip_empty_lines: true,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return [];
      }
      throw new StorageError(`Failed to fetch ${filename}`, error);
    }
  }

  async getCities(): Promise<City[]> {
    const records = await this.fetchCsv(this.citiesFile);

    return records.map((record: any) => ({
      _id: parseInt(record._id),
      name: record.name,
      slug: record.slug,
      timezone: record.timezone,
      last_game_id: record.last_game_id ? parseInt(record.last_game_id) : undefined,
    }));
  }

  async getCityBySlug(slug: string): Promise<City | null> {
    const cities = await this.getCities();
    return cities.find(city => city.slug === slug) || null;
  }

  async getGames(
    params: {
      cityId?: number;
      cursor?: string;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
      series?: string;
    },
    options?: { withSeries: boolean } = { withSeries: false }
  ): Promise<{
    data: Game[];
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  }> {
    let records = await this.fetchCsv(this.gamesFile);

    // Apply filters
    if (params.cityId) {
      records = records.filter((record: any) => parseInt(record.city_id) === params.cityId);
    }

    if (params.search) {
      const search = params.search.toLowerCase();
      records = records.filter(
        (record: any) =>
          record._id.toString().includes(search) ||
          record.number.toLowerCase().includes(search) ||
          record.location.toLowerCase().includes(search)
      );
    }

    if (params.series) {
      records = records.filter((record: any) => record.series_id === params.series);
    }

    // Apply sorting
    const sortField = params.sort || 'date';
    const sortOrder = params.order || 'desc';
    records.sort((a: any, b: any) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    // Apply pagination
    const startIndex = params.cursor ? parseInt(params.cursor) : 0;
    const limit = params.limit || 20;
    const endIndex = startIndex + limit;
    const paginatedRecords = records.slice(startIndex, endIndex);

    return {
      data: await Promise.all(
        paginatedRecords.map(async (record: any) => ({
          _id: parseInt(record._id),
          city_id: parseInt(record.city_id),
          series_id: record.series_id,
          series: options.withSeries ? (await this.getSeriesById(record.series_id))?.name : undefined,
          number: record.number,
          date: new Date(record.date),
          price: parseFloat(record.price),
          location: record.location,
          address: record.address,
          is_stream: record.is_stream === 'true',
          processed: record.processed === 'true',
        }))
      ),
      total: records.length,
      hasMore: endIndex < records.length,
      nextCursor: endIndex < records.length ? endIndex.toString() : undefined,
    };
  }

  async getGameById(id: number): Promise<Game | null> {
    const { data } = await this.getGames({});
    return data.find(game => game._id === id) || null;
  }

  async getGamesByTeam(
    teamId: string,
    params: {
      cursor?: string;
      limit?: number;
      sort?: string;
      order?: 'asc' | 'desc';
      search?: string;
      series?: string;
    }
  ): Promise<{
    data: Game[];
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  }> {
    const results = await this.getTeamResults(teamId);
    const gameIds = results.map(result => result.game_id);
    const { data, total, hasMore, nextCursor } = await this.getGames(params);
    return {
      data: data.filter(game => gameIds.includes(game._id)),
      total,
      hasMore,
      nextCursor,
    };
  }

  async getGameResults(gameId: number): Promise<GameResult[]> {
    const records = await this.fetchCsv(this.resultsFile);
    const gameResults = records
      .filter((record: any) => parseInt(record.game_id) === gameId)
      .map((record: any) => ({
        _id: record._id,
        game_id: parseInt(record.game_id),
        team_id: record.team_id,
        rounds: JSON.parse(record.rounds),
        sum: parseFloat(record.sum),
        place: parseInt(record.place),
        rank_id: record.rank_id,
        has_errors: record.has_errors === 'true',
      }));
    console.log(gameResults);
    return gameResults;
  }

  async getTeamResults(teamId: string): Promise<GameResult[]> {
    const records = await this.fetchCsv(this.resultsFile);

    return records
      .filter((record: any) => record.team_id === teamId)
      .map((record: any) => ({
        _id: record._id,
        game_id: parseInt(record.game_id),
        team_id: record.team_id,
        rounds: JSON.parse(record.rounds),
        sum: parseFloat(record.sum),
        place: parseInt(record.place),
        rank_id: record.rank_id,
        has_errors: record.has_errors === 'true',
      }));
  }

  async getTeamBySlug(slug: string, cityId: number): Promise<Team | null> {
    const records = await this.fetchCsv(this.teamsFile);

    const team = records.find((record: any) => record.slug === slug && parseInt(record.city_id) === cityId);

    if (!team) return null;

    return {
      _id: team._id,
      city_id: parseInt(team.city_id),
      name: team.name,
      slug: team.slug,
      previous_team_id: team.previous_team_id || undefined,
      inconsistent_rank: team.inconsistent_rank === 'true',
    };
  }

  async getTeamStats(params: {
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
  }> {
    let records = await this.fetchCsv(this.teamsFile);

    if (params.cityId) {
      records = records.filter((record: any) => parseInt(record.city_id) === params.cityId);
    }

    if (params.search) {
      const search = params.search.toLowerCase();
      records = records.filter((record: any) => record.name.toLowerCase().includes(search));
    }

    const startIndex = params.cursor ? parseInt(params.cursor) : 0;
    const limit = params.limit || 20;
    const endIndex = startIndex + limit;
    const paginatedRecords = records.slice(startIndex, endIndex);

    return {
      data: paginatedRecords.map((record: any) => ({
        _id: record._id,
        city_id: parseInt(record.city_id),
        name: record.name,
        slug: record.slug,
        previous_team_id: record.previous_team_id || undefined,
        inconsistent_rank: record.inconsistent_rank === 'true',
      })),
      total: records.length,
      hasMore: endIndex < records.length,
      nextCursor: endIndex < records.length ? endIndex.toString() : undefined,
    };
  }

  async getSeries(): Promise<Series[]> {
    const records = await this.fetchCsv(this.seriesFile);

    return records.map((record: any) => ({
      _id: record._id,
      name: record.name,
      slug: record.slug,
    }));
  }

  async getSeriesById(id: string): Promise<Series | null> {
    const series = await this.getSeries();
    return series.find(s => s._id === id) || null;
  }

  async getSeriesBySlug(slug: string): Promise<Series | null> {
    const series = await this.getSeries();
    return series.find(s => s.slug === slug) || null;
  }

  async getRankMappings(): Promise<RankMapping[]> {
    const records = await this.fetchCsv(this.ranksFile);

    return records.map((record: any) => ({
      _id: record._id,
      name: record.name,
      image_urls: record.image_urls.split(','),
    }));
  }
}
