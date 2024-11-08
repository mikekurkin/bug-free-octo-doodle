import { format } from 'date-fns';
import { ArrowUpDown, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { Game, QueryParams } from '../types/data';

interface GamesTableProps {
  games: Game[];
  isLoading: boolean;
  hasMore: boolean;
  onQueryChange: (params: QueryParams, isInitial?: boolean) => Promise<string | undefined>;
}

// Update the SortField type
type SortField = '_id' | 'date' | 'series_id' | 'number' | 'location';

export const GamesTable: React.FC<GamesTableProps> = ({
  games,
  isLoading,
  hasMore,
  onQueryChange
}) => {
  const navigate = useNavigate();
  const loadingRef = React.useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<SortField>('_id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  const { citySlug } = useParams();

  const lastElementRef = useInfiniteScroll(
    () => onQueryChange({ cursor: games.length.toString(), sort: sortField, order: sortOrder, search }),
    hasMore,
  );

  const handleSort = (field: SortField) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setSortField(field);
    onQueryChange({ sort: field, order: newOrder, search }, true);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    onQueryChange({ search: value, sort: sortField, order: sortOrder }, true);
  };

  const renderSortIcon = (field: SortField) => (
    <ArrowUpDown
      className={`w-4 h-4 inline-block ml-1 ${sortField === field ? 'text-blue-600' : 'text-gray-400'}`}
    />
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('tables.search.games')}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('_id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>{t('tables.headers.id')}</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  {t('common.date')} {renderSortIcon('date')}
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('series_id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>{t('tables.headers.series')}</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('number')}
                >
                  {t('tables.headers.packageNumber')} {renderSortIcon('number')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('location')}
                >
                  {t('common.location')} {renderSortIcon('location')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {games.map((game, index) => (
                <tr
                  key={game._id}
                  ref={index === games.length - 1 ? lastElementRef : null}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => navigate(`/${citySlug}/game/${game._id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {game._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(game.date, 'dd.MM.yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {game.series?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/${citySlug}/package/${game.series?.slug}/${game.number}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      #{game.number}
                    </Link>{/*.{getGameNumber(game)}*/}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {game.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            ref={loadingRef}
            className="p-4 text-center text-gray-500"
          >
            {isLoading ? t('common.loading') : hasMore ? t('common.loading') : t('common.thatsAll')}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          {t('common.loading')}
        </div>
      )}
    </div>
  );
};
