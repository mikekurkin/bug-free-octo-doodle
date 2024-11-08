import { format } from 'date-fns';
import { Package, Star, Target, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { GameResultsTable } from '../components/GameResultsTable';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RoundPerformanceChart } from '../components/RoundPerformanceChart';
import { useStorage } from '../contexts/StorageContext';
import { City, Game, GameResult, Series } from '../types/data';

export const GameDetailsPage = () => {
  const { t } = useTranslation();
  const storage = useStorage();
  const { citySlug, id: gameId } = useParams();

  const [city, setCity] = useState<City | null>(null);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [gameData, setGameData] = useState<GameResult[]>([]);
  const [currentSeries, setCurrentSeries] = useState<Series | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!citySlug || !gameId) return;

      const cityData = await storage.getCityBySlug(citySlug);
      setCity(cityData);

      const gameData = await storage.getGameById(parseInt(gameId), { withSeries: true });
      setCurrentGame(gameData);

      if (gameData) {
        const results = await storage.getGameResults(gameData._id);
        setGameData(results);

        const seriesData = await storage.getSeriesById(gameData.series_id);
        setCurrentSeries(seriesData);
      }
    };

    loadData();
  }, [storage, citySlug, gameId]);

  if (!gameId || !city) {
    return <div>{t('errors.gameNotFound')}</div>;
  }
  if (!currentGame) { return <LoadingSpinner />; }

  const averageScore = Math.round(gameData.reduce((sum, result) => sum + result.sum, 0) / gameData.length);
  const topScore = Math.max(...gameData.map(result => result.sum));
  const participantCount = gameData.length;
  const roundCount = gameData[0]?.rounds.length || 0;

  const metrics = [
    {
      title: t('metrics.package'),
      value: (
        <Link
          to={`/${citySlug}/package/${currentGame.series?.slug}/${currentGame.number}`}
          className="text-blue-600 hover:underline flex items-center space-x-1"
        >
          <span>#{currentGame.number}</span>
          <span className="text-sm text-gray-500">
            {t('metrics.inSeries', { series: currentSeries?.name })}
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
                {format(currentGame.date, 'dd.MM.yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">City</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {city.name}
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
        <GameResultsTable gameId={currentGame._id} />
      </div>
    </div>
  );
};
