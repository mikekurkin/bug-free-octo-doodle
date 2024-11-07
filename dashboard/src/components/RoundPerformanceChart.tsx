import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../hooks/useTheme';
import { GameResult } from '../types/data';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface RoundPerformanceChartProps {
  results: GameResult[];
}

interface TooltipContext {
  parsed: {
    y: number;
  };
}

export const RoundPerformanceChart: React.FC<RoundPerformanceChartProps> = ({ results }) => {
  const { theme } = useTheme();
  const maxRounds = Math.max(...results.map(r => r.rounds.length));

  const roundAverages = Array.from({ length: maxRounds }, (_, i) => {
    return results.length > 0
      ? results.reduce((sum, result) => sum + (result.rounds[i] || 0), 0) / results.length
      : 0;
  });

  const chartData = {
    labels: Array.from({ length: maxRounds }, (_, i) => `R${i + 1}`),
    datasets: [
      {
        label: 'Average Round Score',
        data: roundAverages,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    scales: {
      y: {
        beginAtZero: true,
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
        display: false,
        labels: {
          color: theme === 'dark' ? '#9CA3AF' : '#4B5563',
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipContext) => {
            return `Average: ${context.parsed.y.toFixed(1)} points`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <div className="h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Average Round Performance</h3>
      <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
