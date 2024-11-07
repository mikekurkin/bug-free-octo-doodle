import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { calculateKDE, estimateBandwidth } from '../utils/teamStats';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface TeamDistributionChartProps {
  pointsValues: number[];
  efficiencyValues: number[];
}

interface TooltipContext {
  parsed: {
    x: number;
    y: number;
  };
}

export const TeamDistributionChart: React.FC<TeamDistributionChartProps> = ({
  pointsValues,
  efficiencyValues
}) => {
  const { t } = useTranslation()
  // Calculate KDE for points
  const pointsBandwidth = estimateBandwidth(pointsValues);
  const pointsKDE = calculateKDE(pointsValues, pointsBandwidth);

  // Calculate KDE for efficiency
  const efficiencyBandwidth = estimateBandwidth(efficiencyValues);
  const efficiencyKDE = calculateKDE(efficiencyValues, efficiencyBandwidth);

  const pointsData = {
    labels: pointsKDE.x,
    datasets: [
      {
        label: t('charts.pointsDistribution'),
        data: pointsKDE.y,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const efficiencyData = {
    labels: efficiencyKDE.x,
    datasets: [
      {
        label: t('charts.efficiencyDistribution'),
        data: efficiencyKDE.y,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipContext) => {
            const density = context.parsed.y.toFixed(4);
            const value = context.parsed.x.toFixed(0);
            return `Density: ${density} at ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('charts.density')
        }
      },
      x: {
        title: {
          display: true,
          text: t('charts.value')
        }
      }
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('charts.pointsDistributionTitle')}
        </h3>
        <Line data={pointsData} options={options} />
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('charts.efficiencyDistributionTitle')}
        </h3>
        <Line data={efficiencyData} options={options} />
      </div>
    </div>
  );
};
