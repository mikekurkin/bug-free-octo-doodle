import { Medal, Target, Trophy } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { GamesTable } from '../components/GamesTable';
import { MetricCard } from '../components/MetricCard';
import { TeamDistributionChart } from '../components/TeamDistributionChart';
import { TeamPerformanceChart } from '../components/TeamPerformanceChart';
import { useStorage } from '../contexts/StorageContext';
import { Game, GameResult, QueryParams } from '../types/data';
import { calculateEfficiency } from '../utils/teamStats';

export const TeamDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { teamSlug } = useParams();
  const storage = useStorage();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [teamData, setTeamData] = useState<{ results: GameResult[] }>({ results: [] });
  const { citySlug } = useParams();

  useEffect(() => {
    const loadTeamData = async () => {
      if (!teamSlug || !citySlug) return;

      const city = await storage.getCityBySlug(citySlug);
      const cityId = city ? city._id : null;
      if (!cityId) return;

      const team = await storage.getTeamBySlug(teamSlug, cityId);
      if (team) {
        const results = await storage.getTeamResults(team._id, { withTeams: true });
        setTeamData({ results });
      }
    };

    loadTeamData();
  }, [citySlug, storage, teamSlug]);

  const loadGames = useCallback(async (params: QueryParams, isInitial = false) => {
    if (!teamSlug) return;

    setIsLoading(true);
    try {
      if (!citySlug) throw new Error("City slug is undefined");
      const city = await storage.getCityBySlug(citySlug);
      const cityId = city ? city._id : null;
      if (!cityId) return;

      const team = await storage.getTeamBySlug(teamSlug, cityId);
      if (team) {
        const response = await storage.getGamesByTeam(team._id, params, { withSeries: true });
        setGames(prev => isInitial ? response.data : [...prev, ...response.data]);
        setHasMore(response.hasMore);
        return response.nextCursor;
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setIsLoading(false);
    }
  }, [citySlug, storage, teamSlug]);

  useEffect(() => console.log(games), [games]);

  useEffect(() => {
    loadGames({ sort: 'date', order: 'desc' }, true);
  }, [loadGames]);

  const metrics = [
    {
      title: t('metrics.totalGames'),
      value: teamData.results.length,
      change: 5.2,
      icon: Trophy
    },
    {
      title: t('metrics.averagePoints'),
      value: Math.round(teamData.results.reduce((sum, r) => sum + r.sum, 0) / teamData.results.length),
      change: 8.7,
      icon: Target
    },
    {
      title: t('metrics.bestPlace'),
      value: `#${Math.min(...teamData.results.map(r => r.place))}`,
      change: 12.3,
      icon: Medal
    },
    // {
    //   title: t('metrics.rankDistribution'),
    //   value: (() => {
    //     const ranks = teamData.results.reduce((acc, r) => {
    //       acc[r.rank_id] = (acc[r.rank_id] || 0) + 1;
    //       return acc;
    //     }, {} as Record<string, number>);
    //     const topRank = Object.entries(ranks)
    //       .sort((a, b) => b[1] - a[1])[0];
    //     return topRank ? t(`ranks.${topRank[0]}`) : t('ranks.none');
    //   })(),
    //   change: -2.1,
    //   icon: Star
    // }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="space-y-8">
        <div className="mb-8">
          <TeamPerformanceChart data={teamData.results} />
        </div>

        <div className="mb-8">
          <TeamDistributionChart
            pointsValues={teamData.results.map((r) => r.sum)}
            efficiencyValues={teamData.results.map((r) => {
              const results = teamData.results.filter((gr) => gr.game_id === r.game_id);
              const maxScore = Math.max(...results.map((gr) => gr.sum));
              return calculateEfficiency(r.sum, maxScore);
            })}
          />
        </div>

        <div className="mb-8">
          <GamesTable
            games={games}
            isLoading={isLoading}
            hasMore={hasMore}
            onQueryChange={loadGames}
          />
        </div>
      </div>
    </div>
  );
};
