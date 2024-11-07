import { Medal, Star, Target, Trophy } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { GamesTable } from '../components/GamesTable';
import { MetricCard } from '../components/MetricCard';
import { TeamDistributionChart } from '../components/TeamDistributionChart';
import { TeamPerformanceChart } from '../components/TeamPerformanceChart';
import { gameResults, teams } from '../data/mockData';
import { fetchGamesByTeam } from '../services/api';
import { Game, QueryParams } from '../types/data';
import { calculateEfficiency } from '../utils/teamStats';

export const TeamDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { teamSlug } = useParams();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Get team data for metrics and charts
  const team = teams.find(t => t.slug === teamSlug);
  const teamData = {
    results: gameResults.filter(result => result.team_id === team?._id)
  };

  const loadGames = useCallback(async (params: QueryParams, isInitial = false) => {
    if (!team?._id) return;

    setIsLoading(true);
    try {
      const response = await fetchGamesByTeam(team._id, params);
      setGames(prev => isInitial ? response.data : [...prev, ...response.data]);
      setHasMore(response.hasMore);
      return response.nextCursor;
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setIsLoading(false);
    }
  }, [team?._id]);

  // Add this useEffect for initial loading
  useEffect(() => {
    loadGames({ sort: 'date', order: 'desc' }, true);
  }, [loadGames]);

  // Calculate metrics
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
    {
      title: t('metrics.rankDistribution'),
      value: (() => {
        const ranks = teamData.results.reduce((acc, r) => {
          acc[r.rank] = (acc[r.rank] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topRank = Object.entries(ranks)
          .sort((a, b) => b[1] - a[1])[0];
        return topRank ? t(`ranks.${topRank[0]}`) : t('ranks.none');
      })(),
      change: -2.1,
      icon: Star
    }
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
              const results = gameResults.filter((gr) => gr.game_id === r.game_id);
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
