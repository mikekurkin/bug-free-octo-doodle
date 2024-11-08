import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', name: 'EN' },
  { code: 'ru', name: 'RU' },
];

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg
          bg-gray-100 dark:bg-gray-700/50
          hover:bg-gray-200 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-300
          transition-colors duration-200"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {LANGUAGES.find(lang => lang.code === i18n.language)?.name || 'English'}
        </span>
      </button>

      <div className="absolute right-0 mt-2 py-2
        bg-white dark:bg-gray-800
        rounded-lg shadow-lg
        border border-gray-200 dark:border-gray-700
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 z-50">
        {LANGUAGES.map(({ code, name }) => (
          <button
            key={code}
            onClick={() => i18n.changeLanguage(code)}
            className={`w-full px-4 py-2 text-left text-sm
              ${code === i18n.language ?
                'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};
