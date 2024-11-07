import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Users, Trophy } from 'lucide-react';
import { Game, GameResult } from '../types/data';
import { useTranslation } from 'react-i18next';

interface GameCardProps {
  game: Game;
  results: GameResult[];
}

export const GameCard: React.FC<GameCardProps> = ({ game, results }) => {
  const { t } = useTranslation();
  const participantCount = results.length;
  const topScore = Math.max(...results.map(r => r.sum));
  const roundCount = results[0]?.rounds.length || 0;

  return (
    <Link
      to={`/game/${game.id}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('common.game')} #{game.number}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(game.date), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full text-sm">
            {roundCount} {t('common.rounds')}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{game.location}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">{participantCount} {t('common.teams')}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Trophy className="w-4 h-4 mr-2" />
            <span className="text-sm">{topScore} {t('common.points')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
