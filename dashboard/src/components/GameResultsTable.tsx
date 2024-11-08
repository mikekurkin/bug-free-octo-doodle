import { ArrowUpDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useStorage } from '../contexts/StorageContext';
import { GameResult, RankMapping } from '../types/data';

interface GameResultsTableProps {
  gameId: number;
}

type SortField = 'sum' | 'place' | 'team';
type SortOrder = 'asc' | 'desc';

export const GameResultsTable: React.FC<GameResultsTableProps> = ({ gameId }) => {
  const { t } = useTranslation();
  const storage = useStorage();
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
    field: 'place',
    order: 'asc'
  });
  const { citySlug } = useParams();

  const [results, setResults] = useState<GameResult[]>([]);
  const [rankMappings, setRankMappings] = useState<RankMapping[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const gameResults = await storage.getGameResults(gameId, { withTeams: true });
      setResults(gameResults);

      // Load rank mappings
      const rankData = await storage.getRankMappings();
      setRankMappings(rankData);
    };

    loadData();
  }, [storage, gameId]);

  // Sort results
  const sortedResults = [...results].sort((a, b) => {
    const multiplier = sort.order === 'asc' ? 1 : -1;

    switch (sort.field) {
      case 'sum':
        return (b.sum - a.sum) * multiplier;
      case 'place':
        return (a.place - b.place) * multiplier;
      case 'team':
        return (a.team?.name || '').localeCompare(b.team?.name || '') * multiplier;
      default:
        return 0;
    }
  });

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const roundColumns = results[0]?.rounds.length || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('place')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('common.place')}</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.rank')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('team')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('common.team')}</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
              {Array.from({ length: roundColumns }, (_, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('tables.headers.round', { number: i + 1 })}
                </th>
              ))}
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('sum')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('tables.headers.sum')}</span>
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedResults.map((result, index) => (
              <tr key={`${result.game_id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                  #{result.place}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {result.rank_id ?
                    rankMappings.find(r => r._id === result.rank_id)?.name :
                    t('ranks.none')
                  }
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  {result.team && (
                    <Link
                      to={`/${citySlug}/teams/${result.team.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {result.team.name}
                    </Link>
                  )}
                </td>
                {result.rounds.map((score, i) => (
                  <td key={i} className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {score}
                  </td>
                ))}
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {result.sum}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
