import { format } from 'date-fns';
import { Package, Star, Target, Trophy, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { GameResultsTable } from '../components/GameResultsTable';
import { RoundPerformanceChart } from '../components/RoundPerformanceChart';
import { cities, gameResults, games, series } from '../data/mockData';

export const GameDetailsPage = () => {
  const { t } = useTranslation();
  const { citySlug, id: gameId } = useParams();
  const city = cities.find(c => c.slug === citySlug);

  if (!gameId || !city) {
    return <div>{t('errors.gameNotFound')}</div>;
  }

  const currentGame = games.find(game =>
    game._id === parseInt(gameId) //&& game.city_id === city._id
  );

  if (!currentGame) {
    return <div>{t('errors.gameNotFound')}</div>;
  }

  const gameData = gameResults.filter(result => result.game_id === parseInt(gameId));

  const averageScore = Math.round(gameData.reduce((sum, result) => sum + result.sum, 0) / gameData.length);
  const topScore = Math.max(...gameData.map(result => result.sum));
  const participantCount = gameData.length;
  const roundCount = gameData[0]?.rounds.length || 0;

  const metrics = [
    {
      title: t('metrics.package'),
      value: (
        <Link
          to={`/${citySlug}/series/${currentGame.series_id}/package/${currentGame.number}`}
          className="text-blue-600 hover:underline flex items-center space-x-1"
        >
          <span>#{currentGame.number}</span>
          <span className="text-sm text-gray-500">
            {t('metrics.inSeries', { series: series.find(s => s._id === currentGame.series_id)?.name })}
          </span>
        </Link>
      ),
      icon: Package
    },
    {
      title: t('metrics.rounds'),
      value: roundCount,
      icon: Target
    },
    {
      title: t('metrics.teams'),
      value: participantCount,
      icon: Users
    },
    {
      title: t('metrics.topScore'),
      value: topScore,
      icon: Trophy
    },
    {
      title: t('metrics.averageScore'),
      value: averageScore,
      icon: Star
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-2">
              <metric.icon className="w-5 h-5" />
              <h3 className="font-medium">{metric.title}</h3>
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <RoundPerformanceChart results={gameData} />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('gameDetails.gameInformation')}
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {format(new Date(currentGame.date), 'dd.MM.yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">City</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {cities.find(c => c._id === currentGame.city_id)?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{currentGame.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{currentGame.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <GameResultsTable gameId={gameId} />
      </div>
    </div>
  );
};
