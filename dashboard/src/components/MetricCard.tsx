import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  change?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-2">
        <Icon className="w-5 h-5" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
};
