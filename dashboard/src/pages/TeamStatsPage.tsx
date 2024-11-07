import { ArrowUpDown, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { cities, games } from '../data/mockData';
import { fetchTeamStats } from '../services/api';
import { TeamStats } from '../types/data';

export const TeamStatsPage = () => {
  const { t } = useTranslation();
  const { citySlug } = useParams();
  const city = cities.find(c => c.slug === citySlug);

  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string>();
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [sort, setSort] = useState<{ field: keyof TeamStats; order: 'asc' | 'desc' }>({
    field: 'totalPoints',
    order: 'desc'
  });

  const loadingRef = useRef<HTMLDivElement>(null);
  const series = ['all', ...new Set(games.map(game => game.series))];

  const loadTeamStats = useCallback(async (params: QueryParams, isInitial = false) => {
    if (loading || !city) return;
    setLoading(true);

    try {
      const response = await fetchTeamStats({
        ...params,
        city_id: city._id.toString()
      });

      setTeamStats(prev => isInitial ? response.data : [...prev, ...response.data]);
      setCursor(response.nextCursor);
    } catch (error) {
      console.error(t('teamStats.error'), error);
    } finally {
      setLoading(false);
    }
  }, [loading, city, t]);

  useEffect(() => {
    loadTeamStats({
      cursor: undefined,
      search,
      series: selectedSeries === 'all' ? undefined : selectedSeries,
      sort: sort.field,
      order: sort.order
    }, true);
  }, [cursor, loading, search, selectedSeries, sort.field, sort.order, t, loadTeamStats]);

  const handleSort = (field: keyof TeamStats) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('teamStats.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-white
                placeholder-gray-500 dark:placeholder-gray-400
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                focus:border-transparent outline-none"
            />
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <select
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none"
          >
            {series.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('teamStats.team')}
                  </th>
                  {Object.keys(teamStats[0] || {}).filter(field => field !== 'team').map((field) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field as keyof TeamStats)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {teamStats.map((stat) => (
                  <tr key={stat.team} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/${citySlug}/teams/${stat.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {stat.team_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stat.gamesPlayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stat.totalPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {stat.avgPoints.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      #{stat.bestPlace}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div ref={loadingRef} className="flex justify-center py-4">
        {loading && <div className="text-gray-600 dark:text-gray-400">{t('teamStats.loading')}</div>}
      </div>
    </div>
  );
};
