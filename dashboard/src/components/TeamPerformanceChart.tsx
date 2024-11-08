import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  TooltipItem
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { useStorage } from '../contexts/StorageContext';
import { useTheme } from '../hooks/useTheme';
import { Game, GameResult } from '../types/data';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TeamPerformanceChartProps {
  data: GameResult[];
}

export const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const storage = useStorage();
  const [games, setGames] = React.useState<Game[]>([]);

  React.useEffect(() => {
    const loadGames = async () => {
      const gameIds = [...new Set(data.map(result => result.game_id))];
      const loadedGames = await Promise.all(
        gameIds.map(id => storage.getGameById(Number(id)))
      );
      setGames(loadedGames.filter((game): game is Game => game !== null));
    };
    loadGames();
  }, [data, storage]);

  const sortedResults = [...data].sort((a, b) => {
    const gameA = games.find(g => g._id === Number(a.game_id));
    const gameB = games.find(g => g._id === Number(b.game_id));
    return new Date(gameA?.date || '').getTime() - new Date(gameB?.date || '').getTime();
  });

  const chartData = {
    labels: sortedResults.map(result => {
      const game = games.find(g => g._id === Number(result.game_id));
      return game?.date ? new Date(game.date).toLocaleDateString() : '';
    }),
    datasets: [
      {
        label: t('common.points'),
        data: sortedResults.map(r => r.sum),
        borderColor: theme === 'dark' ? '#60A5FA' : '#2563EB',
        backgroundColor: theme === 'dark' ? '#60A5FA33' : '#2563EB33',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: t('common.place'),
        data: sortedResults.map(r => r.place),
        borderColor: theme === 'dark' ? '#F87171' : '#DC2626',
        backgroundColor: theme === 'dark' ? '#F8717133' : '#DC262633',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    scales: {
      y: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
        }
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
        },
        title: {
          display: true,
          text: t('charts.performanceTitle'),
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
        }
      },
      tooltip: {
        callbacks: {
          title: (context: TooltipItem<'line'>[]) => {
            const game = games.find(g => g._id === Number(sortedResults[context[0].dataIndex].game_id));
            return game ? `Game ${game.number} (${new Date(game.date).toLocaleDateString()})` : '';
          },
          label: (context: TooltipItem<'line'>) => {
            return context.dataset.label === t('common.points')
              ? t('charts.pointsLabel', { value: context.raw })
              : t('charts.placeLabel', { value: context.raw });
          }
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <div className="h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
