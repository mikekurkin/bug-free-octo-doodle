import axios from 'axios';
import { load } from 'cheerio';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';
import type { Storage } from '../storage/interface';
import type { City, GameResult, RankMapping } from '../types';
import { columnMatchers } from '../utils/columnMatcher';
import { logger } from '../utils/logger';
import { normalizeText } from '../utils/normalize';
import { generateSlug } from '../utils/slug';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

interface ColumnIndexes {
  team: number;
  rounds: number[];
  total: number;
  place?: number;
  rank?: number;
  team_city?: number;
}

function findColumnIndexes($: cheerio.Root, headerRow: cheerio.Cheerio): ColumnIndexes {
  const indexes: Partial<ColumnIndexes> = {
    rounds: [],
  };

  $(headerRow)
    .find('td')
    .each((colIndex, cell) => {
      const cellText = $(cell).text().trim().toLowerCase();

      if (columnMatchers.team.findColumn(cellText)) {
        indexes.team = colIndex;
      } else if (columnMatchers.round.findColumn(cellText)) {
        indexes.rounds!.push(colIndex);
      } else if (columnMatchers.total.findColumn(cellText)) {
        indexes.total = colIndex;
      } else if (columnMatchers.place.findColumn(cellText)) {
        indexes.place = colIndex;
      } else if (columnMatchers.team_city.findColumn(cellText)) {
        indexes.team_city = colIndex;
      } else if (columnMatchers.rank.findColumn(cellText)) {
        indexes.rank = colIndex;
      }
    });

  if (indexes.place === undefined && $(headerRow).find('td').first().text() === '') {
    indexes.place = 0;
  }

  if (indexes.team === undefined) {
    throw new Error('Team name column not found');
  }
  if (!indexes.rounds?.length) {
    throw new Error('No round columns found');
  }
  if (indexes.total === undefined) {
    throw new Error('Total score column not found');
  }

  return indexes as ColumnIndexes;
}

async function generateUniqueSlug(baseName: string, cityId: number, storage: Storage): Promise<string> {
  let slug = generateSlug(baseName);
  let counter = 1;

  // Keep checking until we find a unique slug
  while (true) {
    const existingTeam = await storage.findTeamBySlugAndCity(slug, cityId);
    if (!existingTeam) {
      return slug;
    }
    // If slug exists, append counter and try again
    slug = `${generateSlug(baseName)}-${counter}`;
    counter++;
  }
}

export async function scrapeResults(
  gameId: number,
  city: City,
  rankMappings: RankMapping[],
  storage: Storage
): Promise<GameResult[]> {
  logger.info(`Processing game ${gameId} in ${city.name}`);

  try {
    const response = await axios.get(`https://${city.slug}.quizplease.ru/game-page`, {
      params: { id: gameId },
      httpsAgent,
    });

    const $ = load(response.data);
    const results: GameResult[] = [];

    const table = $('table')
      .filter((_, table) => {
        const headerText = $(table).find('thead td').text().toLowerCase();
        return columnMatchers.team.findColumn(headerText) || columnMatchers.round.findColumn(headerText);
      })
      .first();

    if (!table.length) {
      logger.warn(`No results table found for game ${gameId}`);
      return [];
    }

    const headerRow = table.find('thead tr');
    const columns = findColumnIndexes($, headerRow);

    for (const row of table.find('tbody tr').toArray()) {
      const $row = $(row);
      const teamName = $row.find(`td:eq(${columns.team})`).text().trim();
      const teamCity = $row.find(`td:eq(${columns.team_city})`).text().trim();

      // Find or create team
      const team_city = (await storage.findCityByName(teamCity)) ?? city;
      let team = await storage.findTeamByNameAndCity(teamName, team_city._id);

      if (!team) {
        let rank_id: string | undefined;
        if (columns.rank !== undefined) {
          const rankImgSrc = $row.find(`td:eq(${columns.rank}) img`).attr('src');
          if (rankImgSrc) {
            const rankMapping = rankMappings.find(r => r.image_urls.includes(rankImgSrc));
            rank_id = rankMapping?._id;
          }
        }

        team = {
          _id: uuidv4(),
          city_id: team_city._id,
          name: normalizeText(teamName),
          slug: await generateUniqueSlug(teamName, team_city._id, storage),
          inconsistent_rank: !!rank_id,
        };

        await storage.saveTeam(team);
      }

      const rounds: number[] = [];
      columns.rounds.forEach(colIndex => {
        const score = parseFloat($row.find(`td:eq(${colIndex})`).text().replace(',', '.')) || 0;
        rounds.push(score);
      });

      const calculatedSum = rounds.reduce((a, b) => a + b, 0);
      const displayedSum = parseFloat($row.find(`td:eq(${columns.total})`).text().replace(',', '.')) || 0;

      let rank_id: string | undefined;
      if (columns.rank !== undefined) {
        const rankImgSrc = $row.find(`td:eq(${columns.rank}) img`).attr('src');
        if (rankImgSrc) {
          const rankMapping = rankMappings.find(r => r.image_urls.includes(rankImgSrc));
          rank_id = rankMapping?._id;
        }
      }

      const result: GameResult = {
        _id: uuidv4(),
        game_id: gameId,
        team_id: team._id,
        rounds,
        sum: displayedSum,
        place: parseInt($row.find(`td:eq(${columns.place ?? -1})`).text()) || 0,
        rank_id,
        has_errors: Math.abs(calculatedSum - displayedSum) > 0.01,
      };

      results.push(result);
    }

    return results;
  } catch (error) {
    logger.error(`Failed to scrape results for game ${gameId}:`, error);
    return [];
  }
}
