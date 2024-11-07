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
import { games } from '../data/mockData';
import { useTheme } from '../hooks/useTheme';
import { GameResult } from '../types/data';

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

  const sortedResults = [...data].sort((a, b) => {
    const gameA = games.find(g => g._id === a.game_id);
    const gameB = games.find(g => g._id === b.game_id);
    return new Date(gameA?.date || '').getTime() - new Date(gameB?.date || '').getTime();
  });

  const chartData = {
    labels: sortedResults.map(result => {
      const game = games.find(g => g._id === result.game_id);
      return game?.number || '';
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
          title: (context: TooltipItem<'line'>[]) => t('charts.gameTooltip', { number: context[0].label }),
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
