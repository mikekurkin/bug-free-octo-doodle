import { Home, List, Trophy } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const location = useLocation();
  const isTeamsPage = location.pathname === '/teams';

  const { t } = useTranslation();


  return (
    <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">

            <Link
              to="/"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              aria-label="Go home"
            >
              <Home className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                  !isTeamsPage
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
                <span>{t('common.games')}</span>
              </Link>
              <Link
                to="/teams"
                className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                  isTeamsPage
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>{t('common.teams')}</span>
              </Link>
            </div>

            <LanguageToggle />

            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};
